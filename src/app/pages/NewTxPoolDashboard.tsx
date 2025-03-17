import React, { useEffect, useRef, useState, useCallback, useReducer } from "react";
import { Card, CardContent, Typography, Grid, Paper } from "@mui/material";
import { FixedSizeList as List } from "react-window"; // Virtualized Table
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { WebSocketClient } from "../../Network/WebsocketClient";
import { IncomingTxnUpdate, DiagTxn } from "../../Network/mockData/RandomTxGenerator";
import { Transaction, getBytes } from "ethers";
import ProbabilityChart from "../components/TxPool/ProbabilityChart";

const txLimit = 100000; // Limit the number of transactions to prevent memory bloat

function parseRlpTransaction(base64Rlp: string) {
	// Step 1: Decode Base64 to Uint8Array
	const rlpBytes = getBytes(atob(base64Rlp));

	// Step 2: Convert Uint8Array to Hex String
	const rlpHex = "0x" + Array.from(rlpBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

	// Step 3: Parse the RLP transaction
	const tx = Transaction.from(rlpHex);

	console.log("Parsed Transaction:", tx);
	return tx.to;
}

// Memoized Row Component for Virtualized Table
const MemoizedRow: React.FC<{ index: number; style: React.CSSProperties; data: DiagTxn[] }> = ({ index, style, data }) => {
	const tx = data[index];

	//const receiver = parseRlpTransaction(tx.rlp);
	const receiver = "0x" + tx.hash.slice(0, 10);

	return (
		<div style={style}>
			<Paper style={{ padding: "8px", marginBottom: "4px" }}>
				<Typography variant="body2">
					<strong>Tx:</strong> {tx.hash} | <strong>Sender:</strong> {tx.senderID} | <strong>Receiver:</strong> {receiver} | <strong>Nonce:</strong>{" "}
					{tx.nonce}
				</Typography>
				<Typography variant="body2">
					<strong>Value:</strong> {(Number(tx.value) / 1e18).toFixed(4)} ETH | <strong>Gas:</strong> {tx.gas}
				</Typography>
			</Paper>
		</div>
	);
};

const NewTxPoolDashboard: React.FC = () => {
	const [knownTxns, setKnownTxns] = useState<string[][]>([]);
	const [txPoolData, setTxPoolData] = useState<DiagTxn[]>([]);
	const messagesRef = useRef<IncomingTxnUpdate[]>([]);
	const client = WebSocketClient.getInstance();

	useEffect(() => {
		client.subscribe("txpool", (data) => {
			console.log("Received transaction update:", data);
			messagesRef.current.push(data);
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
			if (messagesRef.current.length > 0) {
				// Copy messagesRef to prevent mutations affecting updates
				const copyMessagesRef = [...messagesRef.current];

				setTxPoolData((prev) => {
					const newTxns = copyMessagesRef.flatMap((msg) => msg.txns);
					return [...newTxns, ...prev].slice(0, txLimit); // Keep only latest txLimit txns
				});

				setKnownTxns((prev) => {
					const newKnownTxns = copyMessagesRef.flatMap((msg) => msg.knownTxns);
					return [...newKnownTxns, ...prev].slice(0, txLimit); // Keep only latest txLimit txns
				});

				messagesRef.current = [];
			}
		}, 500);

		return () => clearInterval(interval);
	}, []); // Empty dependency array ensures this effect runs only once

	// Compute statistics outside render
	const totalIncomeTnxs = txPoolData.length;
	const avgGasPrice = txPoolData.length ? txPoolData.reduce((sum, tx) => sum + Number(tx.feeCap), 0) / txPoolData.length / 1e9 : 0;
	const blobTransactions = txPoolData.filter((tx) => tx.blobHashes && tx.blobHashes.length > 0).length;

	return (
		<Grid
			container
			spacing={3}
			sx={{ padding: 3 }}
		>
			{/* Mempool Overview */}
			<Grid
				item
				xs={12}
				md={4}
			>
				<Card>
					<CardContent>
						<Typography variant="h6">Total Incomming tnxs</Typography>
						<Typography variant="h4">{totalIncomeTnxs} txns</Typography>
					</CardContent>
				</Card>
			</Grid>
			<Grid
				item
				xs={12}
				md={4}
			>
				<Card>
					<CardContent>
						<Typography variant="h6">Known tnxs</Typography>
						<Typography variant="h4">{knownTxns.length} txns</Typography>
					</CardContent>
				</Card>
			</Grid>

			<Grid
				item
				xs={12}
				md={4}
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
				md={4}
			>
				<Card>
					<CardContent>
						<Typography variant="h6">Blob Transactions</Typography>
						<Typography variant="h4">{blobTransactions}</Typography>
					</CardContent>
				</Card>
			</Grid>

			{/* Gas Price Distribution */}
			<Grid
				item
				xs={12}
			>
				<Card>
					<CardContent>
						<Typography variant="h6">Gas Price Distribution</Typography>
						<Bar
							data={{
								labels: ["5 Gwei", "10 Gwei", "15 Gwei", "20 Gwei"],
								datasets: [
									{
										label: "Tx Count",
										data: txPoolData.reduce(
											(acc, tx) => {
												const gwei = Number(tx.feeCap) / 1e9;
												if (gwei < 5) acc[0] += 1;
												else if (gwei < 10) acc[1] += 1;
												else if (gwei < 15) acc[2] += 1;
												else acc[5] += 1;
												return acc;
											},
											[0, 0, 0, 0, 0] // Buckets for gas prices
										),
										backgroundColor: "rgba(75,192,192,0.6)"
									}
								]
							}}
							options={{ responsive: false, maintainAspectRatio: false }}
						/>
					</CardContent>
				</Card>
			</Grid>

			{/* Virtualized Transaction List */}
			<Grid
				item
				xs={12}
			>
				<Card>
					<CardContent>
						<Typography variant="h6">Pending Transactions</Typography>
						<List
							height={500} // Set height to limit rendering area
							itemCount={txPoolData.length}
							itemSize={60} // Adjust based on row height
							width="100%"
							itemData={txPoolData} // Pass transaction data
						>
							{({ index, style, data }: { index: number; style: React.CSSProperties; data: DiagTxn[] }) => (
								<MemoizedRow
									index={index}
									style={style}
									data={data}
								/>
							)}
						</List>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
};

export default NewTxPoolDashboard;
