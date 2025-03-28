import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, Typography, Grid, Paper, Tabs, Tab } from "@mui/material";
import { FixedSizeList as List } from "react-window"; // Virtualized Table
import "chart.js/auto";
import { WebSocketClient } from "../../Network/WebsocketClient";
import { IncomingTxnUpdate, DiagTxn } from "../../Network/mockData/RandomTxGenerator";

interface TxnUpdate {
	txnHash: string;
	pool: string;
	event: string;
}

const txLimit = 100000; // Limit the number of transactions to prevent memory bloat

const NormalRow: React.FC<{ index: number; style: React.CSSProperties; data: DiagTxn[] }> = ({ index, style, data }) => {
	const tx = data[index];

	return (
		<div style={style}>
			<Paper style={{ padding: "8px", marginBottom: "4px" }}>
				<Typography variant="body2">
					<strong>Tx:</strong> {"0x" + tx.hash} | <strong>Sender:</strong> {tx.senderAddress} | <strong>Nonce:</strong> {tx.nonce}
				</Typography>
				<Typography variant="body2">
					<strong>Value:</strong> {(Number(tx.value) / 1e18).toFixed(4)} ETH | <strong>Gas:</strong> {tx.gas}
				</Typography>
			</Paper>
		</div>
	);
};

const DiscardedRow: React.FC<{ index: number; style: React.CSSProperties; data: DiagTxn[] }> = ({ index, style, data }) => {
	const tx = data[index];

	return (
		<div style={style}>
			<Paper style={{ padding: "8px", marginBottom: "4px" }}>
				<Typography variant="body2">
					<strong>Tx:</strong> {"0x" + tx.hash} | <strong>Sender:</strong> {tx.senderAddress} | <strong>Nonce:</strong> {tx.nonce}
				</Typography>
				<Typography variant="body2">
					<strong>Value:</strong> {(Number(tx.value) / 1e18).toFixed(4)} ETH | <strong>Gas:</strong> {tx.gas}
				</Typography>
				<Typography
					variant="body2"
					color="error"
					sx={{
						mt: 1,
						backgroundColor: "rgba(211, 47, 47, 0.1)",
						p: 0.5,
						borderRadius: 1,
						wordBreak: "break-word",
						whiteSpace: "normal"
					}}
				>
					<strong>Discard Reason:</strong> {tx.discardReason}
				</Typography>
			</Paper>
		</div>
	);
};

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
			{...other}
		>
			{value === index && children}
		</div>
	);
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

	// Filter transactions based on selected tab
	const getFilteredTransactions = () => {
		switch (selectedTab) {
			case 0: // All
				return txPoolData;
			case 1: // Pending
				return txPoolData.filter((tx) => tx.pool === "Pending");
			case 2: // Base Fee
				return txPoolData.filter((tx) => tx.pool === "BaseFee");
			case 3: // Queued
				return txPoolData.filter((tx) => tx.pool === "Queued");
			case 4: // Blob Transactions
				return txPoolData.filter((tx) => tx.blobHashes && tx.blobHashes.length > 0);
			case 5: // Discarded Transactions
				return txPoolData.filter((tx) => tx.discardReason !== "" && tx.discardReason !== "success");
			default:
				return txPoolData;
		}
	};

	useEffect(() => {
		client.subscribe("txpool", (data) => {
			console.log("Received transaction update:", data);
			if (data.event) {
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
					const allTxns = [...newTxns, ...prev].slice(0, txLimit); // Keep only latest txLimit txns

					copyUpdatesRef.forEach((update) => {
						if (update.event === "add") {
							const tx = allTxns.find((tx) => tx.hash === update.txnHash);
							if (tx) {
								tx.pool = update.pool;
							}
						} else if (update.event === "remove") {
							const tx = allTxns.find((tx) => tx.hash === update.txnHash);
							if (tx) {
								tx.pool = "";
							}
						}
					});

					console.log("allTxns", allTxns);
					return allTxns;
				});

				messagesRef.current = [];
				updatesRef.current = [];
			}
		}, 500);

		return () => clearInterval(interval);
	}, []); // Empty dependency array ensures this effect runs only once

	const totalIncomeTnxs = txPoolData.length;
	const avgGasPrice = txPoolData.length ? txPoolData.reduce((sum, tx) => sum + Number(tx.feeCap), 0) / txPoolData.length / 1e9 : 0;
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
				<Card>
					<CardContent>
						<Typography
							variant="h6"
							sx={{ mb: 2 }}
						>
							Transaction Pool
						</Typography>
						<Tabs
							value={selectedTab}
							onChange={handleTabChange}
							sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
						>
							<Tab label="All Transactions" />
							<Tab label="Pending Pool" />
							<Tab label="Base Fee Pool" />
							<Tab label="Queued Pool" />
							<Tab label="Blob Transactions" />
							<Tab label="Discarded Transactions" />
						</Tabs>
						<List
							height={500}
							itemCount={getFilteredTransactions().length}
							itemSize={selectedTab === 5 ? 90 : 60}
							width="100%"
							itemData={getFilteredTransactions()}
						>
							{({ index, style, data }: { index: number; style: React.CSSProperties; data: DiagTxn[] }) =>
								selectedTab === 5 ? (
									<DiscardedRow
										index={index}
										style={style}
										data={data}
									/>
								) : (
									<NormalRow
										index={index}
										style={style}
										data={data}
									/>
								)
							}
						</List>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
};

export default NewTxPoolDashboard;
