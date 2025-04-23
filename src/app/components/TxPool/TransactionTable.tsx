import React, { useMemo, useCallback } from "react";
import { Card, CardContent, Typography, Paper, Tabs, Tab } from "@mui/material";
import { FixedSizeList as List } from "react-window";
import { DiagTxn } from "../../pages/NewTxPoolDashboard";
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
	stats: {
		all: number;
		pending: number;
		baseFee: number;
		queued: number;
		blob: number;
		discarded: number;
	};
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

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, selectedTab, onTabChange, stats }) => {
	const getFilteredTransactions = useCallback(
		(tabIndex: number) => {
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
		},
		[transactions]
	);

	const filteredTransactions = useMemo(() => getFilteredTransactions(selectedTab), [selectedTab, getFilteredTransactions]);
	const isDiscardedTab = selectedTab === 5;

	// Memoize the row renderer to prevent unnecessary re-renders
	const rowRenderer = useCallback(
		({ index, style, data }: { index: number; style: React.CSSProperties; data: DiagTxn[] }) => {
			return isDiscardedTab ? (
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
			);
		},
		[isDiscardedTab]
	);

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
						<Tab label={`All (${stats.all})`} />
						<Tab label={`Pending (${stats.pending})`} />
						<Tab label={`Base Fee (${stats.baseFee})`} />
						<Tab label={`Queued (${stats.queued})`} />
						<Tab label={`Blob Transactions (${stats.blob})`} />
						<Tab label={`Discarded (${stats.discarded})`} />
					</Tabs>
				</Paper>
				<TabPanel
					value={selectedTab}
					index={selectedTab}
				>
					<List
						height={650}
						itemCount={filteredTransactions.length}
						itemSize={isDiscardedTab ? 200 : 150}
						width="100%"
						itemData={filteredTransactions}
						overscanCount={5}
					>
						{rowRenderer}
					</List>
				</TabPanel>
			</CardContent>
		</Card>
	);
};

export default React.memo(TransactionTable);
