import React, { useState, useRef, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Box,
	Divider,
	Tooltip,
	Chip
} from "@mui/material";
import { DiagTxn } from "../../pages/NewTxPoolDashboard";
import { SubPoolMarker } from "../../pages/NewTxPoolDashboard";
import { InfoAlert } from "../Alerts/InfoAlert";

interface SenderDetailsDialogProps {
	open: boolean;
	onClose: () => void;
	senderAddress: string;
	transactionCount: number;
	senderTransactions: DiagTxn[];
}

const formatValue = (value: bigint | undefined) => {
	if (!value) return "0";
	return value.toString();
};

const CopyableAddress: React.FC<{ address: string | undefined; onCopy: () => void }> = ({ address, onCopy }) => {
	if (!address) return <span>""</span>;

	const handleClick = () => {
		navigator.clipboard.writeText(address);
		onCopy();
	};

	return (
		<Tooltip title="Click to copy full address">
			<span
				onClick={handleClick}
				style={{ cursor: "pointer" }}
			>
				{`${address.slice(0, 6)}...${address.slice(-4)}`}
			</span>
		</Tooltip>
	);
};

const CopyableValue: React.FC<{ value: bigint | undefined; onCopy: () => void }> = ({ value, onCopy }) => {
	if (!value) return <span>0</span>;

	const handleClick = () => {
		navigator.clipboard.writeText(value.toString());
		onCopy();
	};

	return (
		<Tooltip title="Click to copy full value">
			<span
				onClick={handleClick}
				style={{ cursor: "pointer" }}
			>
				{formatValue(value)}
			</span>
		</Tooltip>
	);
};

const getMaskDescription = (order: number) => {
	const descriptions = [];
	if (order & SubPoolMarker.NoNonceGaps) descriptions.push("No Nonce Gaps: No missing nonces in the sequence");
	if (order & SubPoolMarker.EnoughBalance) descriptions.push("Enough Balance: Sender has sufficient balance");
	if (order & SubPoolMarker.NotTooMuchGas) descriptions.push("Not Too Much Gas: Gas limit is reasonable");
	if (order & SubPoolMarker.EnoughFeeCapBlock) descriptions.push("Enough Fee Cap: Fee meets the block's requirements");
	if (order & SubPoolMarker.IsLocal) descriptions.push("Local: Transaction is from a local source");
	return descriptions.join("\n");
};

const formatMask = (order: number) => {
	const bits = [
		order & SubPoolMarker.NoNonceGaps ? "1" : "0",
		order & SubPoolMarker.EnoughBalance ? "1" : "0",
		order & SubPoolMarker.NotTooMuchGas ? "1" : "0",
		order & SubPoolMarker.EnoughFeeCapBlock ? "1" : "0",
		order & SubPoolMarker.IsLocal ? "1" : "0"
	];
	return `Mask: 0b${bits.join("")}`;
};

const SenderDetailsDialog: React.FC<SenderDetailsDialogProps> = ({ open, onClose, senderAddress, transactionCount, senderTransactions }) => {
	const [showCopyAlert, setShowCopyAlert] = useState(false);
	const alertTimeout = useRef<NodeJS.Timeout>();

	const handleCopy = () => {
		setShowCopyAlert(true);
		if (alertTimeout.current) {
			clearTimeout(alertTimeout.current);
		}
		alertTimeout.current = setTimeout(() => {
			setShowCopyAlert(false);
		}, 2000);
	};

	useEffect(() => {
		return () => {
			if (alertTimeout.current) {
				clearTimeout(alertTimeout.current);
			}
		};
	}, []);

	return (
		<>
			<Dialog
				open={open}
				onClose={onClose}
				maxWidth="lg"
				fullWidth
			>
				<DialogTitle>Sender Details</DialogTitle>
				<DialogContent>
					<Box sx={{ mb: 3 }}>
						<Typography variant="h6">
							Address:{" "}
							<CopyableAddress
								address={senderAddress}
								onCopy={handleCopy}
							/>
						</Typography>
						<Typography variant="body1">Total Transactions: {transactionCount}</Typography>
					</Box>
					<Divider sx={{ my: 2 }} />
					<TableContainer
						component={Paper}
						sx={{ maxHeight: "60vh" }}
					>
						<Table
							size="small"
							stickyHeader
						>
							<TableHead>
								<TableRow>
									<TableCell width="12%">Hash</TableCell>
									<TableCell width="5%">Nonce</TableCell>
									<TableCell width="10%">Gas Price</TableCell>
									<TableCell width="10%">Gas Limit</TableCell>
									<TableCell width="12%">To</TableCell>
									<TableCell width="10%">Value</TableCell>
									<TableCell width="10%">Pool</TableCell>
									<TableCell width="31%">Priority Mask</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{senderTransactions.map((tx) => (
									<TableRow key={tx.hash}>
										<TableCell>
											<Tooltip title={tx.hash}>
												<span
													style={{ cursor: "pointer" }}
													onClick={() => {
														navigator.clipboard.writeText(tx.hash);
														handleCopy();
													}}
												>
													<CopyableAddress
														address={tx.hash}
														onCopy={handleCopy}
													/>
												</span>
											</Tooltip>
										</TableCell>
										<TableCell>{tx.tx?.nonce}</TableCell>
										<TableCell>
											<CopyableValue
												value={tx.tx?.gasPrice || BigInt(0)}
												onCopy={handleCopy}
											/>
										</TableCell>
										<TableCell>
											<CopyableValue
												value={tx.tx?.gasLimit || BigInt(0)}
												onCopy={handleCopy}
											/>
										</TableCell>
										<TableCell>
											<Tooltip title={tx.tx?.to || "Contract Creation"}>
												<span>
													{tx.tx?.to ? (
														<CopyableAddress
															address={tx.tx.to}
															onCopy={handleCopy}
														/>
													) : (
														"Contract Creation"
													)}
												</span>
											</Tooltip>
										</TableCell>
										<TableCell>
											<CopyableValue
												value={tx.tx?.value}
												onCopy={handleCopy}
											/>
										</TableCell>
										<TableCell>
											<Chip
												label={tx.pool || "Deleted"}
												size="small"
												color={tx.pool ? "primary" : "error"}
												variant="outlined"
											/>
										</TableCell>
										<TableCell>
											<Tooltip title={<Box sx={{ whiteSpace: "pre-line" }}>{getMaskDescription(tx.order)}</Box>}>
												<Box>
													<Chip
														label={formatMask(tx.order)}
														size="small"
														color="primary"
														variant="outlined"
														sx={{ fontFamily: "monospace" }}
													/>
												</Box>
											</Tooltip>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</DialogContent>
				<DialogActions>
					<Button onClick={onClose}>Close</Button>
				</DialogActions>
			</Dialog>
			{showCopyAlert && <InfoAlert />}
		</>
	);
};

export default SenderDetailsDialog;
