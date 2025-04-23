import React, { useState, useMemo, useCallback } from "react";
import {
	Card,
	CardContent,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	TextField,
	Box,
	InputAdornment,
	Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import SenderDetailsDialog from "./SenderDetailsDialog";
import { DiagTxn } from "../../pages/NewTxPoolDashboard";

interface SendersTableProps {
	senders: [string, number][];
	allTransactions: DiagTxn[];
}

type FilterType = "all" | "top10";

interface RowProps {
	index: number;
	style: React.CSSProperties;
	data: {
		items: [string, number][];
		onRowClick: (sender: [string, number]) => void;
	};
}

const Row: React.FC<RowProps> = React.memo(({ index, style, data }) => {
	const { items, onRowClick } = data;
	const [address, count] = items[index];

	return (
		<div
			style={{
				...style,
				display: "flex",
				alignItems: "center",
				padding: "8px 16px",
				cursor: "pointer",
				borderBottom: "1px solid rgba(224, 224, 224, 1)",
				backgroundColor: "transparent",
				transition: "background-color 0.2s"
			}}
			onClick={() => onRowClick([address, count])}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = "transparent";
			}}
		>
			<div style={{ flex: 1 }}>{address}</div>
			<div style={{ width: 100, textAlign: "right" }}>{count}</div>
		</div>
	);
});

const SendersTable: React.FC<SendersTableProps> = ({ senders, allTransactions }) => {
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [addressFilter, setAddressFilter] = useState<string>("");
	const [selectedSender, setSelectedSender] = useState<[string, number] | null>(null);

	const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterType(event.target.value as FilterType);
	}, []);

	const handleAddressFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressFilter(event.target.value.toLowerCase());
	}, []);

	const handleRowClick = useCallback((sender: [string, number]) => {
		setSelectedSender(sender);
	}, []);

	const handleCloseDialog = useCallback(() => {
		setSelectedSender(null);
	}, []);

	const filteredSenders = useMemo(() => {
		let filtered = senders;

		if (addressFilter) {
			filtered = filtered.filter(([address]) => address.toLowerCase().includes(addressFilter));
		}

		switch (filterType) {
			case "top10":
				return filtered.slice(0, 10);
			default:
				return filtered;
		}
	}, [senders, addressFilter, filterType]);

	const senderTransactions = useMemo(() => {
		if (!selectedSender) return [];
		return allTransactions.filter((tx) => tx.tx?.from === selectedSender[0]);
	}, [selectedSender, allTransactions]);

	const listData = useMemo(
		() => ({
			items: filteredSenders,
			onRowClick: handleRowClick
		}),
		[filteredSenders, handleRowClick]
	);

	return (
		<Card>
			<CardContent sx={{ p: 1 }}>
				<Box sx={{ mb: 2 }}>
					<FormControl
						component="fieldset"
						fullWidth
					>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
							<TextField
								fullWidth
								placeholder="Search by address..."
								value={addressFilter}
								onChange={handleAddressFilterChange}
								size="small"
								InputProps={{
									startAdornment: (
										<InputAdornment position="start">
											<SearchIcon />
										</InputAdornment>
									)
								}}
							/>
							<RadioGroup
								row
								value={filterType}
								onChange={handleFilterChange}
							>
								<FormControlLabel
									value="all"
									control={<Radio />}
									label="All Senders"
								/>
								<FormControlLabel
									value="top10"
									control={<Radio />}
									label="Top 10"
								/>
							</RadioGroup>
						</Box>
					</FormControl>
				</Box>
				<Box sx={{ height: "calc(100vh - 250px)", width: "100%" }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							padding: "8px 16px",
							borderBottom: "1px solid rgba(224, 224, 224, 1)",
							backgroundColor: "background.paper",
							fontWeight: "bold"
						}}
					>
						<div style={{ flex: 1 }}>Address</div>
						<div style={{ width: 100, textAlign: "right" }}>Tx Count</div>
					</Box>
					<AutoSizer>
						{({ height, width }) => (
							<List
								height={height}
								itemCount={filteredSenders.length}
								itemSize={56}
								width={width}
								itemData={listData}
							>
								{Row}
							</List>
						)}
					</AutoSizer>
				</Box>
				{selectedSender && (
					<SenderDetailsDialog
						open={true}
						onClose={handleCloseDialog}
						senderAddress={selectedSender[0]}
						transactionCount={selectedSender[1]}
						senderTransactions={senderTransactions}
					/>
				)}
			</CardContent>
		</Card>
	);
};

export default React.memo(SendersTable);
