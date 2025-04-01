import React from "react";
import { Card, CardContent, Typography, Paper, Tabs, Tab } from "@mui/material";
import { FixedSizeList as List } from "react-window";
import { DiagTxn } from "../../../Network/mockData/RandomTxGenerator";
import { NormalRow, DiscardedRow } from "./TransactionTableRow";

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

interface TransactionTableProps {
	transactions: DiagTxn[];
	selectedTab: number;
	onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
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
			{value === index && <div>{children}</div>}
		</div>
	);
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, selectedTab, onTabChange }) => {
	const getFilteredTransactions = (tabIndex: number) => {
		switch (tabIndex) {
			case 1: // Pending
				return transactions.filter((tx) => tx.pool === "Pending");
			case 2: // Base Fee
				return transactions.filter((tx) => tx.pool === "BaseFee");
			case 3: // Queued
				return transactions.filter((tx) => tx.pool === "Queued");
			case 4: // Blob Transactions
				return transactions.filter((tx) => tx.blobHashes && tx.blobHashes.length > 0);
			case 5: // Discarded Transactions
				return transactions.filter((tx) => tx.discardReason !== "" && tx.discardReason !== "success");
			default: // All
				return transactions;
		}
	};

	const filteredTransactions = getFilteredTransactions(selectedTab);
	const isDiscardedTab = selectedTab === 5;

	return (
		<Card>
			<CardContent>
				<Typography
					variant="h5"
					gutterBottom
				>
					Transaction Pool
				</Typography>
				<Paper sx={{ width: "100%" }}>
					<Tabs
						value={selectedTab}
						onChange={onTabChange}
						indicatorColor="primary"
						textColor="primary"
						variant="scrollable"
						scrollButtons="auto"
					>
						<Tab label="All" />
						<Tab label="Pending" />
						<Tab label="Base Fee" />
						<Tab label="Queued" />
						<Tab label="Blob Transactions" />
						<Tab label="Discarded Transactions" />
					</Tabs>
				</Paper>
				<TabPanel
					value={selectedTab}
					index={selectedTab}
				>
					<List
						height={600}
						itemCount={filteredTransactions.length}
						itemSize={selectedTab === 5 ? 200 : 150}
						width="100%"
						itemData={filteredTransactions}
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
				</TabPanel>
			</CardContent>
		</Card>
	);
};

export default TransactionTable;
