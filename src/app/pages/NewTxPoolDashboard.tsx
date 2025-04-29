import React, { useEffect, useState, useMemo } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { WebSocketClient } from "../../Network/WebsocketClient";
import { Transaction } from "ethers";
import TransactionTable from "../components/TxPool/TransactionTable";
import SendersTable from "../components/TxPool/SendersTable";

export type DiagTxn = {
	hash: string;
	rlp: string;
	senderID: number;
	size: number;
	creation: boolean;
	dataLen: number;
	accessListAddrCount: number;
	accessListStorCount: number;
	blobHashes: string[] | null;
	isLocal: boolean;
	discardReason: string;
	pool: string;
	tx: Transaction;
	order: SubPoolMarker;
};

export type IncomingTxnUpdate = {
	txns: DiagTxn[];
	updates: { [key: string]: string[][] }; // Converted [32]byte array to string representation in JS
};

export type BlockUpdate = {
	minedTxns: DiagTxn[];
	unwoundTxns: DiagTxn[];
	unwoundBlobTxns: DiagTxn[];
	blkNum: number;
	blkTime: number;
};

export enum SubPoolMarker {
	NoNonceGaps = 0b010000,
	EnoughBalance = 0b001000,
	NotTooMuchGas = 0b000100,
	EnoughFeeCapBlock = 0b000010,
	IsLocal = 0b000001,
	BaseFeePoolBits = NoNonceGaps | EnoughBalance | NotTooMuchGas
}

// Limit the number of transactions to prevent memory bloat
const TX_LIMIT = 1000; // Reduced from 100000 to 1000
const BLOCK_HISTORY_LIMIT = 100;

function decodeTransacrionRLP(diagTxn: DiagTxn): Transaction {
	try {
		let rlp = diagTxn.rlp;

		const base64ToHex = (base64: string) => {
			const binaryString = atob(base64);
			let hex = "";
			for (let i = 0; i < binaryString.length; i++) {
				const byte = binaryString.charCodeAt(i).toString(16).padStart(2, "0");
				hex += byte;
			}
			return hex;
		};

		const hexRlp = base64ToHex(rlp);
		const tx = Transaction.from("0x" + hexRlp);
		return tx;
	} catch (error) {
		console.error("Error decoding transaction:", error);
		throw error;
	}
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
		</div>
	);
}

export interface SenderInfo {
	senderId: number;
	senderNonce: number;
	senderBalance: string;
	blockGasLimit: number;
}

export interface DisplaySenderInfo {
	senderAddress: string;
	transactions: DiagTxn[];
	senderId: number;
	senderNonce: number;
	senderBalance: string;
	blockGasLimit: number;
}

const NewTxPoolDashboard: React.FC = () => {
	const [txPoolData, setTxPoolData] = useState<DiagTxn[]>([]);
	const [blockData, setBlockData] = useState<BlockUpdate[]>([]);
	const [senderData, setSenderData] = useState<SenderInfo[]>([]);
	const [selectedTab, setSelectedTab] = useState(0);
	const [mainTab, setMainTab] = useState(0);
	const client = WebSocketClient.getInstance();

	// Memoize transaction statistics
	const stats = useMemo(() => {
		const result = {
			all: txPoolData.length,
			pending: 0,
			baseFee: 0,
			queued: 0,
			blob: 0,
			discarded: 0
		};

		// Single pass through the data
		for (const tx of txPoolData) {
			if (tx.pool === "Pending") result.pending++;
			else if (tx.pool === "BaseFee") result.baseFee++;
			else if (tx.pool === "Queued") result.queued++;
			if (tx.blobHashes && tx.blobHashes.length > 0) result.blob++;
			if (tx.discardReason !== "" && tx.discardReason !== "success") result.discarded++;
		}

		return result;
	}, [txPoolData]);

	const senderStats: DisplaySenderInfo[] = useMemo(() => {
		// Group transactions by sender address
		const txsBySender: Record<string, DiagTxn[]> = {};
		txPoolData.forEach((tx) => {
			const from = tx.tx?.from;
			if (from) {
				if (!txsBySender[from]) txsBySender[from] = [];
				txsBySender[from].push(tx);
			}
		});

		// Build DisplaySenderInfo for each sender
		return Object.entries(txsBySender).map(([address, transactions]) => {
			// Try to find sender info (if mapping is possible)
			// Here, we just pick the first senderData entry for demonstration
			// You may want to improve this logic if you can map address <-> senderId

			//look for senderid
			const senderId = transactions[0]?.senderID || 0;
			let info = senderData.find((info) => info.senderId === senderId);
			if (!info) {
				info = { senderId: senderId, senderNonce: 0, senderBalance: "0", blockGasLimit: 0 };
			}

			return {
				senderAddress: address,
				transactions,
				senderId: info.senderId,
				senderNonce: info.senderNonce,
				senderBalance: info.senderBalance,
				blockGasLimit: info.blockGasLimit
			};
		});
	}, [txPoolData, senderData]);

	useEffect(() => {
		client.subscribe("txpool", (data) => {
			if (data.type === "poolChangeEvent") {
				const update = data.message;
				setTxPoolData((prev) => {
					const newData = [...prev];
					const txIndex = newData.findIndex((tx) => tx.hash === update.txnHash);

					if (txIndex !== -1) {
						if (update.event === "add") {
							newData[txIndex].pool = update.pool;
							newData[txIndex].order = update.order;
						} else {
							// Remove transaction if it's deleted
							newData.splice(txIndex, 1);
						}
					}

					// Keep only the most recent transactions
					return newData.slice(0, TX_LIMIT);
				});
			} else if (data.type === "blockUpdate") {
				setBlockData((prev) => [data.message, ...prev].slice(0, BLOCK_HISTORY_LIMIT));
			} else if (data.type === "senderInfoUpdate") {
				console.log("senderInfoUpdate", data.message);
				try {
					setSenderData((prev) => [
						...prev,
						{
							senderId: data.message.senderId,
							senderNonce: data.message.senderNonce,
							senderBalance: data.message.senderBalance,
							blockGasLimit: data.message.blockGasLimit
						}
					]);
				} catch (error) {
					console.error("Error parsing sender info:", error);
				}
			} else {
				const newTxns = data.message.txns;
				initTransaction(newTxns);
				setTxPoolData((prev) => {
					// Remove older transactions if we're exceeding the limit
					const combinedTxns = [...newTxns, ...prev];
					const uniqueTxns = Array.from(new Map(combinedTxns.map((tx) => [tx.hash, tx])).values());
					return uniqueTxns.slice(0, TX_LIMIT);
				});
			}
		});

		return () => {
			client.unsubscribe("txpool");
		};
	}, []);

	function initTransaction(txns: DiagTxn[]) {
		txns.forEach((txn) => {
			if (txn.rlp) {
				const tx = decodeTransacrionRLP(txn);
				txn.tx = tx;
			}
		});
	}

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setSelectedTab(newValue);
	};

	const handleMainTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setMainTab(newValue);
	};

	return (
		<Box sx={{ padding: 2 }}>
			<Tabs
				value={mainTab}
				onChange={handleMainTabChange}
				sx={{ mb: 1 }}
			>
				<Tab label="Pool Content" />
				{/*<Tab label="Recent Blocks" />*/}
				<Tab label="Senders" />
			</Tabs>

			<TabPanel
				value={mainTab}
				index={0}
			>
				<Box sx={{ height: "calc(100vh - 100px)", overflow: "auto" }}>
					<TransactionTable
						transactions={txPoolData}
						selectedTab={selectedTab}
						onTabChange={handleTabChange}
						stats={stats}
					/>
				</Box>
			</TabPanel>

			{/*<TabPanel
				value={mainTab}
				index={1}
			>
				<Card>
					<CardContent sx={{ p: 1 }}>
						<TableContainer
							component={Paper}
							sx={{ maxHeight: "calc(100vh - 120px)" }}
						>
							<Table
								size="small"
								stickyHeader
							>
								<TableHead>
									<TableRow>
										<TableCell>Block Number</TableCell>
										<TableCell>Mined Transactions</TableCell>
										<TableCell>Unwound Transactions</TableCell>
										<TableCell>Unwound Blob Transactions</TableCell>
										<TableCell>Block Time</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{blockData.map((block, index) => (
										<TableRow key={index}>
											<TableCell>{block.blkNum}</TableCell>
											<TableCell>{block?.minedTxns?.length}</TableCell>
											<TableCell>{block?.unwoundTxns?.length}</TableCell>
											<TableCell>{block?.unwoundBlobTxns?.length}</TableCell>
											<TableCell>{new Date(block.blkTime * 1000).toLocaleString()}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</CardContent>
				</Card>
			</TabPanel>*/}

			<TabPanel
				value={mainTab}
				index={1}
			>
				<SendersTable
					senders={senderStats}
					allTransactions={txPoolData}
				/>
			</TabPanel>
		</Box>
	);
};

export default NewTxPoolDashboard;
