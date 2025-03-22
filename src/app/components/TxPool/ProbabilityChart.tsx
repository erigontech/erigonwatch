import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { DiagTxn } from "../../../Network/mockData/RandomTxGenerator";

const processData = (txPoolData: DiagTxn[]) => {
	if (txPoolData.length === 0) return [];

	// Step 1: Extract Unique Gwei Prices from feeCap
	const gweiPrices = [...new Set(txPoolData.map((tx) => Number(tx.feeCap) / 1e9))] // Convert to Gwei
		.sort((a, b) => b - a); // Sort Descending (Highest Gwei First)

	// Step 2: Create a Map for Counting Transactions in Each Gwei Bucket
	const bucketCounts = new Map(gweiPrices.map((price) => [price, 0]));

	// Step 3: Count Transactions in Each Gwei Bucket
	txPoolData.forEach((tx) => {
		const gwei = Number(tx.feeCap) / 1e9;
		if (bucketCounts.has(gwei)) {
			bucketCounts.set(gwei, bucketCounts.get(gwei)! + 1);
		}
	});

	// Step 4: Compute Probabilities
	const totalTxs = txPoolData.length;
	const probabilityData = gweiPrices.map((price) => {
		const probability = totalTxs > 0 ? (bucketCounts.get(price)! / totalTxs) * 100 : 0;

		// Assign Colors Based on Probability
		let color = "#D4A94C"; // Default Orange (<50%)
		if (probability >= 99) color = "#4CAF50"; // Dark Green (99%)
		else if (probability >= 95) color = "#A5D6A7"; // Light Green (95%)

		return { price: price.toFixed(1), probability, color };
	});

	return probabilityData;
};

const ProbabilityChart: React.FC<{ txPoolData: DiagTxn[] }> = ({ txPoolData }) => {
	const [chartData, setChartData] = useState([]);

	useEffect(() => {
		setChartData(processData(txPoolData));
	}, [txPoolData]);

	return (
		<div style={{ width: "100%", height: 300, padding: 20, borderRadius: 10 }}>
			<h3 style={{ color: "#fff", textAlign: "center" }}>Probability of Inclusion in Next Block</h3>
			<ResponsiveContainer
				width="100%"
				height="100%"
			>
				<BarChart
					data={chartData}
					margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="price"
						stroke="#ccc"
						label={{ value: "Gas Price (GWEI)", position: "insideBottom", dy: 10 }}
					/>
					<YAxis stroke="#ccc" />
					<Tooltip />
					<Bar
						dataKey="probability"
						stackId="a"
					>
						{chartData.map((entry, index) => (
							<Bar
								key={index}
								dataKey="probability"
								fill="#8884d8"
								stackId="a"
							/>
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default ProbabilityChart;
