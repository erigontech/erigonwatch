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
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	TextField,
	Box,
	InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SenderDetailsDialog from "./SenderDetailsDialog";
import { DiagTxn, DisplaySenderInfo } from "../../pages/NewTxPoolDashboard";

interface SendersTableProps {
	senders: DisplaySenderInfo[];
	allTransactions: DiagTxn[];
}

type FilterType = "all" | "top10";

const SendersTable: React.FC<SendersTableProps> = ({ senders, allTransactions }) => {
	const [filterType, setFilterType] = useState<FilterType>("all");
	const [addressFilter, setAddressFilter] = useState<string>("");
	const [selectedSender, setSelectedSender] = useState<DisplaySenderInfo | null>(null);

	const handleFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setFilterType(event.target.value as FilterType);
	}, []);

	const handleAddressFilterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressFilter(event.target.value.toLowerCase());
	}, []);

	const handleRowClick = useCallback((sender: DisplaySenderInfo) => {
		setSelectedSender(sender);
	}, []);

	const handleCloseDialog = useCallback(() => {
		setSelectedSender(null);
	}, []);

	const filteredSenders = useMemo(() => {
		let filtered = senders;

		if (addressFilter) {
			filtered = filtered.filter((info) => info.senderAddress.toLowerCase().includes(addressFilter));
		}

		switch (filterType) {
			case "top10":
				return [...filtered].sort((a, b) => b.transactions.length - a.transactions.length).slice(0, 10);
			default:
				return filtered;
		}
	}, [senders, addressFilter, filterType]);

	return (
		<Card>
			<CardContent sx={{ p: 1, height: "calc(100vh - 220px)" }}>
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
				<Box sx={{ height: "100%", width: "100%" }}>
					<TableContainer sx={{ height: "100%", maxHeight: "100%", width: "100%" }}>
						<Table stickyHeader>
							<TableHead>
								<TableRow>
									<TableCell>Address</TableCell>
									<TableCell>Nonce</TableCell>
									<TableCell>Balance</TableCell>
									<TableCell>Tx Count</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{filteredSenders.map((info) => (
									<TableRow
										key={info.senderAddress}
										onClick={() => handleRowClick(info)}
										style={{ cursor: "pointer" }}
									>
										<TableCell>{info.senderAddress}</TableCell>
										<TableCell>{info.senderNonce}</TableCell>
										<TableCell>
											{(() => {
												try {
													const eth = Number(BigInt(info.senderBalance)) / 1e18;
													return eth.toLocaleString(undefined, { maximumFractionDigits: 5 }) + " ETH";
												} catch {
													return "0 ETH";
												}
											})()}
										</TableCell>
										<TableCell>{info.transactions.length}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
				{selectedSender && (
					<SenderDetailsDialog
						open={true}
						onClose={handleCloseDialog}
						senderAddress={selectedSender.senderAddress}
						transactionCount={selectedSender.transactions.length}
						senderTransactions={selectedSender.transactions}
						senderNonce={selectedSender.senderNonce}
						senderBalance={selectedSender.senderBalance}
						blockGasLimit={selectedSender.blockGasLimit}
					/>
				)}
			</CardContent>
		</Card>
	);
};

export default React.memo(SendersTable);
