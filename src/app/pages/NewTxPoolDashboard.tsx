import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import "chart.js/auto";
import { WebSocketClient } from "../../Network/WebsocketClient";
import { IncomingTxnUpdate, DiagTxn } from "../../Network/mockData/RandomTxGenerator";
import { Transaction } from "ethers";
import TransactionTable from "../components/TxPool/TransactionTable";

export enum SubPoolMarker {
	NoNonceGaps = 0b010000,
	EnoughBalance = 0b001000,
	NotTooMuchGas = 0b000100,
	EnoughFeeCapBlock = 0b000010,
	IsLocal = 0b000001,
	BaseFeePoolBits = NoNonceGaps | EnoughBalance | NotTooMuchGas
}

interface TxnUpdate {
	//test this
	txnHash: string;
	pool: string;
	event: string;
	order: SubPoolMarker;
}

const txLimit = 100000; // Limit the number of transactions to prevent memory bloat

function decodeTransacrionRLP(diagTxn: DiagTxn): Transaction {
	try {
		let rlp = diagTxn.rlp;

		// Convert base64 to hex
		const base64ToHex = (base64: string) => {
			const binaryString = atob(base64);
			let hex = "";
			for (let i = 0; i < binaryString.length; i++) {
				const byte = binaryString.charCodeAt(i).toString(16).padStart(2, "0");
				hex += byte;
			}
			return hex;
		};

		// Convert base64 RLP to hex
		const hexRlp = base64ToHex(rlp);

		// Decode the transaction
		const tx = Transaction.from("0x" + hexRlp);

		//compare tx with diagTxn is data the same
		return tx;
	} catch (error) {
		console.error("Error decoding transaction:", error);
		throw error;
	}
}

const NewTxPoolDashboard: React.FC = () => {
	const [txPoolData, setTxPoolData] = useState<DiagTxn[]>([]);
	const [selectedTab, setSelectedTab] = useState(0);
	const messagesRef = useRef<IncomingTxnUpdate[]>([]);
	const updatesRef = useRef<TxnUpdate[]>([]);
	const client = WebSocketClient.getInstance();

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setSelectedTab(newValue);
	};

	useEffect(() => {
		client.subscribe("txpool", (data) => {
			//console.log("Received transaction update:", data);
			if (data.event) {
				console.log("Received transaction update:", data);
				updatesRef.current.push(data);
			} else {
				messagesRef.current.push(data);
			}
		});

		// Define the beforeunload handler to unsubscribe early
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			client.unsubscribe("txpool");
			event.preventDefault();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			client.unsubscribe("txpool");
		};
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (messagesRef.current.length > 0 || updatesRef.current.length > 0) {
				// Copy messagesRef to prevent mutations affecting updates
				const copyMessagesRef = [...messagesRef.current];
				const copyUpdatesRef = [...updatesRef.current];
				setTxPoolData((prev) => {
					const newTxns = copyMessagesRef.flatMap((msg) => msg.txns);
					// Decode and set tx field for new transactions
					/*newTxns.forEach((txn) => {
						if (txn?.rlp) {
							const tx = decodeTransacrionRLP(txn);
							txn.tx = tx;
						}
					});*/
					initTransaction(newTxns);
					const allTxns = [...newTxns, ...prev].slice(0, txLimit); // Keep only latest txLimit txns

					copyUpdatesRef.forEach((update) => {
						const tx = allTxns.find((tx) => tx.hash === update.txnHash);
						if (tx) {
							if (update.event === "add") {
								tx.pool = update.pool;
							} else if (update.event === "remove") {
								tx.pool = "";
							}
							tx.order = update.order;
						}
					});

					//console.log("allTxns", allTxns);
					return allTxns;
				});

				messagesRef.current = [];
				updatesRef.current = [];
			}
		}, 500);

		return () => clearInterval(interval);
	}, []); // Empty dependency array ensures this effect runs only once

	function initTransaction(txns: DiagTxn[]) {
		txns.forEach((txn) => {
			if (txn.rlp) {
				const tx = decodeTransacrionRLP(txn);
				txn.tx = tx;
			}
		});
	}

	const totalIncomeTnxs = txPoolData.length;
	const avgGasPrice = txPoolData.length
		? txPoolData.reduce((sum, tx) => sum + Number(tx.tx.gasPrice || tx.tx.maxFeePerGas), 0) / txPoolData.length / 1e9
		: 0;
	const blobTransactions = txPoolData.filter((tx) => tx.blobHashes && tx.blobHashes.length > 0).length;
	const discardedTransactions = txPoolData.filter((tx) => tx.discardReason !== "" && tx.discardReason !== "success").length;

	return (
		<Grid
			container
			spacing={3}
			sx={{ padding: 3 }}
		>
			<Grid
				item
				xs={12}
				md={4}
			>
				<Card
					onClick={() => setSelectedTab(1)}
					sx={{ cursor: "pointer" }}
				>
					<CardContent>
						<Typography variant="h6">Pending Pool</Typography>
						<Typography variant="h4">{txPoolData.filter((tx) => tx.pool === "Pending").length} txns</Typography>
					</CardContent>
				</Card>
			</Grid>
			<Grid
				item
				xs={12}
				md={4}
			>
				<Card
					onClick={() => setSelectedTab(2)}
					sx={{ cursor: "pointer" }}
				>
					<CardContent>
						<Typography variant="h6">BaseFee Pool</Typography>
						<Typography variant="h4">{txPoolData.filter((tx) => tx.pool === "BaseFee").length} txns</Typography>
					</CardContent>
				</Card>
			</Grid>
			<Grid
				item
				xs={12}
				md={4}
			>
				<Card
					onClick={() => setSelectedTab(3)}
					sx={{ cursor: "pointer" }}
				>
					<CardContent>
						<Typography variant="h6">Queued Pool</Typography>
						<Typography variant="h4">{txPoolData.filter((tx) => tx.pool === "Queued").length} txns</Typography>
					</CardContent>
				</Card>
			</Grid>

			<Grid
				item
				xs={12}
				md={3}
			>
				<Card
					onClick={() => setSelectedTab(0)}
					sx={{ cursor: "pointer" }}
				>
					<CardContent>
						<Typography variant="h6">Total Incoming txns</Typography>
						<Typography variant="h4">{totalIncomeTnxs} txns</Typography>
					</CardContent>
				</Card>
			</Grid>

			<Grid
				item
				xs={12}
				md={3}
			>
				<Card>
					<CardContent>
						<Typography variant="h6">Avg Gas Price</Typography>
						<Typography variant="h4">{avgGasPrice.toFixed(2)} Gwei</Typography>
					</CardContent>
				</Card>
			</Grid>

			<Grid
				item
				xs={12}
				md={3}
			>
				<Card
					onClick={() => setSelectedTab(4)}
					sx={{ cursor: "pointer" }}
				>
					<CardContent>
						<Typography variant="h6">Blob Transactions</Typography>
						<Typography variant="h4">{blobTransactions}</Typography>
					</CardContent>
				</Card>
			</Grid>

			<Grid
				item
				xs={12}
				md={3}
			>
				<Card
					onClick={() => setSelectedTab(5)}
					sx={{ cursor: "pointer" }}
				>
					<CardContent>
						<Typography variant="h6">Discarded Transactions</Typography>
						<Typography variant="h4">{discardedTransactions}</Typography>
					</CardContent>
				</Card>
			</Grid>

			<Grid
				item
				xs={12}
			>
				<TransactionTable
					transactions={txPoolData}
					selectedTab={selectedTab}
					onTabChange={handleTabChange}
				/>
			</Grid>
		</Grid>
	);
};

export default NewTxPoolDashboard;
