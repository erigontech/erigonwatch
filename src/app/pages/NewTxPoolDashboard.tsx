import React, { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, Typography, Grid, Paper } from "@mui/material";
import { FixedSizeList as List } from "react-window"; // Virtualized Table
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { WebSocketClient } from "../../Network/WebsocketClient";
import { IncomingTxnUpdate, DiagTxn } from "../../Network/mockData/RandomTxGenerator";

// Memoized Row Component for Virtualized Table
const MemoizedRow: React.FC<{ index: number; style: React.CSSProperties; data: DiagTxn[] }> = ({ index, style, data }) => {
	const tx = data[index];

	return (
		<div style={style}>
			<Paper style={{ padding: "8px", marginBottom: "4px" }}>
				<Typography variant="body2">
					<strong>Tx:</strong> {tx.IDHash} | <strong>Sender:</strong> {tx.SenderID} | <strong>Nonce:</strong> {tx.Nonce}
				</Typography>
				<Typography variant="body2">
					<strong>Value:</strong> {(Number(tx.Value) / 1e18).toFixed(4)} ETH | <strong>Gas:</strong> {tx.Gas}
				</Typography>
			</Paper>
		</div>
	);
};

const NewTxPoolDashboard: React.FC = () => {
	const [txPoolData, setTxPoolData] = useState<DiagTxn[]>([]);
	const messagesRef = useRef<IncomingTxnUpdate[]>([]);
	const client = WebSocketClient.getInstance();

	useEffect(() => {
		client.subscribe("txpool", (data: IncomingTxnUpdate) => {
			console.log("Received transaction update:", data);
			messagesRef.current.push(data);
		});

		return () => {
			client.unsubscribe("txpool");
		};
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (messagesRef.current.length > 0) {
				// Extract new transactions
				setTxPoolData((prev) => [...prev, ...messagesRef.current.flatMap((msg) => msg.Txns)]);
			}
		}, 200);

		return () => clearInterval(interval);
	}, []);

	// Compute statistics outside render
	const mempoolSize = txPoolData.length;
	const avgGasPrice = txPoolData.length ? txPoolData.reduce((sum, tx) => sum + Number(tx.FeeCap), 0) / txPoolData.length / 1e9 : 0;
	const blobTransactions = txPoolData.filter((tx) => tx.BlobHashes.length > 0).length;

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
						<Typography variant="h6">Mempool Size</Typography>
						<Typography variant="h4">{mempoolSize} txns</Typography>
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
								labels: ["10 Gwei", "20 Gwei", "50 Gwei", "100 Gwei"],
								datasets: [
									{
										label: "Tx Count",
										data: txPoolData.reduce(
											(acc, tx) => {
												const gwei = Number(tx.FeeCap) / 1e9;
												if (gwei < 20) acc[0] += 1;
												else if (gwei < 50) acc[1] += 1;
												else if (gwei < 100) acc[2] += 1;
												else acc[3] += 1;
												return acc;
											},
											[0, 0, 0, 0] // Buckets for gas prices
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
