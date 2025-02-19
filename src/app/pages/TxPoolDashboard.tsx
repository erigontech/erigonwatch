import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { WebSocketClient } from "../../Network/WebsocketClient";
import { IncomingTxnUpdate } from "../../Network/mockData/RandomTxGenerator";

// Mock Data (Replace with real API data)
const mockTxPoolData = {
	mempoolSize: 3200,
	avgGasPrice: 45,
	transactions: [
		{ hash: "0x123abc", sender: "0xABC", gasPrice: 50, gasLimit: 21000 },
		{ hash: "0x456def", sender: "0xDEF", gasPrice: 30, gasLimit: 50000 },
		{ hash: "0x789ghi", sender: "0xGHI", gasPrice: 25, gasLimit: 12000 }
	],
	gasPriceDistribution: [10, 20, 50, 100] // Example buckets
};

const TxPoolDashboard: React.FC = () => {
	const [txPoolData, setTxPoolData] = useState(mockTxPoolData);

	const [messages, setMessages] = useState<IncomingTxnUpdate[]>([]);
	const messagesRef = useRef<IncomingTxnUpdate[]>([]);
	const client = WebSocketClient.getInstance();

	useEffect(() => {
		client.subscribe("txpool", (data) => {
			console.log("Received data for txpool:", data);
			messagesRef.current.push(data); // Store in ref
		});

		return () => {
			client.unsubscribe("txpool");
		};
	}, []);

	// Batch updates every 100ms to avoid excessive re-render
	useEffect(() => {
		const interval = setInterval(() => {
			if (messagesRef.current.length > 0) {
				setMessages((prev) => {
					const newMessages = [...prev, ...messagesRef.current]; // Preserve previous messages
					messagesRef.current = [];
					return newMessages;
				});
			}
		}, 200);

		return () => clearInterval(interval);
	}, []);

	// Simulate API call
	useEffect(() => {
		// Fetch data from an API if needed
	}, []);

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
						<Typography
							variant="h6"
							gutterBottom
						>
							Mempool Size
						</Typography>
						<Typography variant="h4">{messages.length} txns</Typography>
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
						<Typography
							variant="h6"
							gutterBottom
						>
							Avg Gas Price
						</Typography>
						<Typography variant="h4">{txPoolData.avgGasPrice} Gwei</Typography>
					</CardContent>
				</Card>
			</Grid>

			{/* Gas Price Distribution Chart */}
			<Grid
				item
				xs={12}
				md={4}
			>
				<Card>
					<CardContent>
						<Typography
							variant="h6"
							gutterBottom
						>
							Gas Price Distribution
						</Typography>
						<Bar
							data={{
								labels: ["10 Gwei", "20 Gwei", "50 Gwei", "100 Gwei"],
								datasets: [
									{
										label: "Tx Count",
										data: txPoolData.gasPriceDistribution,
										backgroundColor: "rgba(75,192,192,0.6)"
									}
								]
							}}
						/>
					</CardContent>
				</Card>
			</Grid>

			{/* Transaction Table */}
			<Grid
				item
				xs={12}
			>
				<Card>
					<CardContent>
						<Typography
							variant="h6"
							gutterBottom
						>
							Pending Transactions
						</Typography>
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>Hash</TableCell>
										<TableCell>Sender</TableCell>
										<TableCell>Gas Price (Gwei)</TableCell>
										<TableCell>Gas Limit</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{txPoolData.transactions.map((tx, index) => (
										<TableRow key={index}>
											<TableCell>{tx.hash}</TableCell>
											<TableCell>{tx.sender}</TableCell>
											<TableCell>{tx.gasPrice}</TableCell>
											<TableCell>{tx.gasLimit}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</CardContent>
				</Card>
			</Grid>
		</Grid>
	);
};

export default TxPoolDashboard;
