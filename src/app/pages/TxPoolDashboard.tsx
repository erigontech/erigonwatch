import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from "@mui/material";
import "chart.js/auto";
import { Line } from "react-chartjs-2";
import { WebSocketClient } from "../../Network/WebsocketClient";
import { IncomingTxnUpdate, DiagTxn, BlockUpdate } from "../../Network/mockData/RandomTxGenerator";
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

interface ChartDataset {
	label: string;
	data: number[];
	borderColor: string;
	tension: number;
}

interface ChartData {
	labels: string[];
	datasets: ChartDataset[];
}

interface DashboardChartData {
	txs: ChartData;
	gasPrice: ChartData;
	blockSize: ChartData;
	pendingTx: ChartData;
	gasUsed: ChartData;
}

const NewTxPoolDashboard: React.FC = () => {
	const [txPoolData, setTxPoolData] = useState<DiagTxn[]>([]);
	const [blockData, setBlockData] = useState<BlockUpdate[]>([]);
	const [selectedTab, setSelectedTab] = useState(0);
	const messagesRef = useRef<IncomingTxnUpdate[]>([]);
	const updatesRef = useRef<TxnUpdate[]>([]);
	const blockUpdateRef = useRef<BlockUpdate[]>([]);
	const client = WebSocketClient.getInstance();

	const totalIncomeTnxs = txPoolData.length;
	const avgGasPrice = txPoolData.length
		? txPoolData.reduce((sum, tx) => sum + Number(tx?.tx?.gasPrice || tx?.tx?.maxFeePerGas), 0) / txPoolData.length / 1e9
		: 0;
	const blobTransactions = txPoolData.filter((tx) => tx.blobHashes && tx.blobHashes.length > 0).length;
	const discardedTransactions = txPoolData.filter((tx) => tx.discardReason !== "" && tx.discardReason !== "success").length;

	const [chartData, setChartData] = useState<DashboardChartData>({
		txs: {
			labels: [],
			datasets: [
				{
					label: "Transactions",
					data: [],
					borderColor: "rgb(255, 99, 132)",
					tension: 0.1
				}
			]
		},
		gasPrice: {
			labels: [],
			datasets: [
				{
					label: "Gas Price",
					data: [],
					borderColor: "rgb(75, 192, 192)",
					tension: 0.1
				}
			]
		},
		blockSize: {
			labels: [],
			datasets: [
				{
					label: "Block Size",
					data: [],
					borderColor: "rgb(153, 102, 255)",
					tension: 0.1
				}
			]
		},
		pendingTx: {
			labels: [],
			datasets: [
				{
					label: "Pending Transactions",
					data: [],
					borderColor: "rgb(54, 162, 235)",
					tension: 0.1
				}
			]
		},
		gasUsed: {
			labels: [],
			datasets: [
				{
					label: "Gas Used",
					data: [],
					borderColor: "rgb(255, 159, 64)",
					tension: 0.1
				}
			]
		}
	});

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setSelectedTab(newValue);
	};

	useEffect(() => {
		client.subscribe("txpool", (data) => {
			console.log("Received type:", data.type);
			if (data.type == "poolChangeEvent") {
				updatesRef.current.push(data.message);
			} else if (data.type == "blockUpdate") {
				blockUpdateRef.current.push(data.message);
			} else {
				messagesRef.current.push(data.message);
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
			if (messagesRef.current.length > 0 || updatesRef.current.length > 0 || blockUpdateRef.current.length > 0) {
				// Copy messagesRef to prevent mutations affecting updates
				const copyMessagesRef = [...messagesRef.current];
				const copyUpdatesRef = [...updatesRef.current];
				const copyBlockUpdates = [...blockUpdateRef.current];

				setTxPoolData((prev) => {
					const newTxns = copyMessagesRef.flatMap((msg) => msg.txns);
					initTransaction(newTxns);
					const allTxns = [...newTxns, ...prev].slice(0, txLimit);

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

					return allTxns;
				});

				if (copyBlockUpdates.length > 0) {
					setBlockData((prev) => [...copyBlockUpdates, ...prev].slice(0, 10)); // Keep last 10 blocks
				}

				messagesRef.current = [];
				updatesRef.current = [];
				blockUpdateRef.current = [];
			}
		}, 500);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (blockData.length > 0) {
				const newLabel = new Date().toLocaleTimeString();
				setChartData((prev) => ({
					txs: {
						labels: [...prev.txs.labels.slice(-20), newLabel],
						datasets: [
							{
								...prev.txs.datasets[0],
								data: [...prev.txs.datasets[0].data.slice(-20), blockData[0].minedTxns?.length || 0]
							}
						]
					},
					gasPrice: {
						labels: [...prev.gasPrice.labels.slice(-20), newLabel],
						datasets: [
							{
								...prev.gasPrice.datasets[0],
								data: [...prev.gasPrice.datasets[0].data.slice(-20), avgGasPrice]
							}
						]
					},
					blockSize: {
						labels: [...prev.blockSize.labels.slice(-20), newLabel],
						datasets: [
							{
								...prev.blockSize.datasets[0],
								data: [...prev.blockSize.datasets[0].data.slice(-20), blockData[0].minedTxns?.length || 0]
							}
						]
					},
					pendingTx: {
						labels: [...prev.pendingTx.labels.slice(-20), newLabel],
						datasets: [
							{
								...prev.pendingTx.datasets[0],
								data: [...prev.pendingTx.datasets[0].data.slice(-20), txPoolData.filter((tx) => tx.pool === "Pending").length]
							}
						]
					},
					gasUsed: {
						labels: [...prev.gasUsed.labels.slice(-20), newLabel],
						datasets: [
							{
								...prev.gasUsed.datasets[0],
								data: [...prev.gasUsed.datasets[0].data.slice(-20), avgGasPrice * (blockData[0].minedTxns?.length || 0)]
							}
						]
					}
				}));
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [blockData, txPoolData, avgGasPrice]);

	function initTransaction(txns: DiagTxn[]) {
		txns.forEach((txn) => {
			if (txn.rlp) {
				const tx = decodeTransacrionRLP(txn);
				txn.tx = tx;
			}
		});
	}

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			y: {
				beginAtZero: true,
				grid: {
					color: "rgba(255, 255, 255, 0.1)"
				}
			},
			x: {
				grid: {
					display: false
				}
			}
		},
		plugins: {
			legend: {
				display: false
			}
		}
	};

	return (
		<Box
			sx={{
				bgcolor: "#1e1e1e",
				color: "white",
				minHeight: "100vh",
				p: 2
			}}
		>
			<Grid
				container
				spacing={2}
			>
				{/* Charts Row */}
				<Grid
					item
					xs={12}
					container
					spacing={2}
				>
					<Grid
						item
						xs={2}
					>
						<Card sx={{ bgcolor: "#2d2d2d", height: "200px" }}>
							<CardContent>
								<Typography variant="subtitle2">TXs / Block</Typography>
								<Line
									data={chartData.txs}
									options={chartOptions}
									height={160}
								/>
							</CardContent>
						</Card>
					</Grid>
					<Grid
						item
						xs={2}
					>
						<Card sx={{ bgcolor: "#2d2d2d", height: "200px" }}>
							<CardContent>
								<Typography variant="subtitle2">Gas Price</Typography>
								<Line
									data={chartData.gasPrice}
									options={chartOptions}
									height={160}
								/>
							</CardContent>
						</Card>
					</Grid>
					<Grid
						item
						xs={2}
					>
						<Card sx={{ bgcolor: "#2d2d2d", height: "200px" }}>
							<CardContent>
								<Typography variant="subtitle2">Block Size</Typography>
								<Line
									data={chartData.blockSize}
									options={chartOptions}
									height={160}
								/>
							</CardContent>
						</Card>
					</Grid>
					<Grid
						item
						xs={3}
					>
						<Card sx={{ bgcolor: "#2d2d2d", height: "200px" }}>
							<CardContent>
								<Typography variant="subtitle2">Pending Tx</Typography>
								<Line
									data={chartData.pendingTx}
									options={chartOptions}
									height={160}
								/>
							</CardContent>
						</Card>
					</Grid>
					<Grid
						item
						xs={3}
					>
						<Card sx={{ bgcolor: "#2d2d2d", height: "200px" }}>
							<CardContent>
								<Typography variant="subtitle2">Gas Used</Typography>
								<Line
									data={chartData.gasUsed}
									options={chartOptions}
									height={160}
								/>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				{/* Transaction List */}
				<Grid
					item
					xs={12}
				>
					<Card sx={{ bgcolor: "#2d2d2d" }}>
						<CardContent>
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell sx={{ color: "white" }}>Time</TableCell>
											<TableCell sx={{ color: "white" }}>Block</TableCell>
											<TableCell sx={{ color: "white" }}>TXs</TableCell>
											<TableCell sx={{ color: "white" }}>Gas Price</TableCell>
											<TableCell sx={{ color: "white" }}>Status</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{blockData.slice(0, 15).map((block, index) => (
											<TableRow key={index}>
												<TableCell sx={{ color: "white" }}>{new Date(block.blkTime * 1000).toLocaleTimeString()}</TableCell>
												<TableCell sx={{ color: "white" }}>{block.blkNum}</TableCell>
												<TableCell sx={{ color: "white" }}>{block?.minedTxns?.length || 0}</TableCell>
												<TableCell sx={{ color: "white" }}>{avgGasPrice.toFixed(2)} Gwei</TableCell>
												<TableCell sx={{ color: "white" }}>{block?.unwoundTxns?.length ? "Unwound" : "Mined"}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</CardContent>
					</Card>
				</Grid>

				{/* Latest Transactions */}
				<Grid
					item
					xs={12}
				>
					<Card sx={{ bgcolor: "#2d2d2d" }}>
						<CardContent>
							<Typography
								variant="h6"
								gutterBottom
							>
								Latest Transactions
							</Typography>
							<TableContainer>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell sx={{ color: "white" }}>Txn Hash</TableCell>
											<TableCell sx={{ color: "white" }}>Method</TableCell>
											<TableCell sx={{ color: "white" }}>From</TableCell>
											<TableCell sx={{ color: "white" }}>To</TableCell>
											<TableCell sx={{ color: "white" }}>Value</TableCell>
											<TableCell sx={{ color: "white" }}>Gas Price</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{txPoolData.slice(0, 10).map((tx, index) => (
											<TableRow key={index}>
												<TableCell sx={{ color: "white", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{tx.hash}</TableCell>
												<TableCell sx={{ color: "white" }}>{tx.pool || "Transfer"}</TableCell>
												<TableCell sx={{ color: "white", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{tx?.tx?.from}</TableCell>
												<TableCell sx={{ color: "white", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }}>{tx?.tx?.to}</TableCell>
												<TableCell sx={{ color: "white" }}>{tx?.tx?.value?.toString() || "0"}</TableCell>
												<TableCell sx={{ color: "white" }}>{(Number(tx?.tx?.gasPrice || tx?.tx?.maxFeePerGas) / 1e9).toFixed(2)} Gwei</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</TableContainer>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default NewTxPoolDashboard;
