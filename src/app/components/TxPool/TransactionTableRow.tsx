import React, { memo, useMemo } from "react";
import { Grid, Paper, Typography, Divider, Chip } from "@mui/material";
import { DiagTxn, SubPoolMarker } from "../../pages/NewTxPoolDashboard";

interface TransactionTableRowProps {
	index: number;
	style: React.CSSProperties;
	data: DiagTxn[];
	isDiscarded?: boolean;
}

const getSubPoolMarkers = (marker: SubPoolMarker | undefined): string[] => {
	if (marker === undefined) return ["Mask: 0b00000"];
	const binaryMask = toMaskString(marker);
	return [`Mask: ${binaryMask}`];
};

function toMaskString(value: number): string {
	const mask = value.toString(2).padStart(6, "0");
	return `0b${mask}`;
}

const getTransactionType = (type: number | null | undefined): string => {
	if (type === null || type === undefined) return "Error: type is null";

	const typeMap: { [key: number]: string } = {
		0: "Legacy",
		1: "Access List",
		2: "Dynamic Fee",
		3: "Blob",
		4: "Set Code",
		5: "Account Abstraction"
	};

	return typeMap[type] || `Unknown (${type})`;
};

const BaseRow: React.FC<TransactionTableRowProps> = memo(({ index, style, data }) => {
	const tx = data[index];

	// Memoize expensive calculations
	const value = useMemo(() => (Number(tx.tx.value) / 1e18).toFixed(4), [tx.tx.value]);
	const subPoolMarkers = useMemo(() => getSubPoolMarkers(tx.order), [tx.order]);
	const transactionType = useMemo(() => getTransactionType(tx?.tx?.type), [tx?.tx?.type]);

	return (
		<div style={{ ...style, height: "auto" }}>
			<Paper style={{ padding: "12px", marginBottom: "4px" }}>
				<Grid
					container
					spacing={1}
				>
					<Grid
						item
						xs={12}
					>
						<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
							<Chip
								label={"Type: " + transactionType}
								size="small"
								color={"primary"}
								variant="outlined"
							/>
							<Chip
								label={"Pool: " + tx.pool || "Deleted"}
								size="small"
								color={tx.pool ? "primary" : "error"}
								variant="outlined"
							/>
							{subPoolMarkers.map((marker, idx) => (
								<Chip
									key={idx}
									label={marker}
									size="small"
									color="primary"
									variant="outlined"
									sx={{ fontFamily: "monospace" }}
								/>
							))}
						</div>
					</Grid>
					<Grid
						item
						xs={12}
						sm={12}
					>
						<Typography variant="body2">
							<strong>Hash:</strong> {"0x" + tx?.tx?.hash || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={6}
					>
						<Typography variant="body2">
							<strong>From:</strong> {tx?.tx?.from || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={6}
					>
						<Typography variant="body2">
							<strong>To:</strong> {tx?.tx?.to || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Nonce:</strong> {tx.tx.nonce}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Value:</strong> {value} ETH
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Gas Limit:</strong> {tx.tx.gasLimit.toString()}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Gas Price:</strong> {tx?.tx?.gasPrice?.toString() || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Max Fee:</strong> {tx?.tx?.maxFeePerGas?.toString() || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Max Priority Fee:</strong> {tx?.tx?.maxPriorityFeePerGas?.toString() || "N/A"}
						</Typography>
					</Grid>
					{/*tx.tx.data !== "0x" && (
						<Grid
							item
							xs={12}
						>
							<Divider sx={{ my: 1 }} />
							<Typography variant="body2">
								<strong>Data:</strong>
							</Typography>
							<Typography
								variant="body2"
								sx={{
									wordBreak: "break-all",
									backgroundColor: "rgba(0, 0, 0, 0.05)",
									p: 1,
									borderRadius: 1,
									fontFamily: "monospace",
									fontSize: "0.8rem"
								}}
							>
								{tx.tx.data}
							</Typography>
						</Grid>
					)*/}
				</Grid>
			</Paper>
		</div>
	);
});

const DiscardReason: React.FC<{ reason: string }> = ({ reason }) => (
	<Grid
		item
		xs={12}
	>
		<Divider sx={{ my: 1 }} />
		<Typography
			variant="body2"
			color="error"
			sx={{
				mt: 1,
				backgroundColor: "rgba(211, 47, 47, 0.1)",
				p: 1,
				borderRadius: 1,
				wordBreak: "break-word",
				whiteSpace: "normal"
			}}
		>
			<strong>Discard Reason:</strong> {reason}
		</Typography>
	</Grid>
);

export const NormalRow: React.FC<TransactionTableRowProps> = memo((props) => <BaseRow {...props} />);

export const DiscardedRow: React.FC<TransactionTableRowProps> = memo(({ index, style, data }) => {
	const tx = data[index];

	// Memoize expensive calculations
	const value = useMemo(() => (Number(tx.tx.value) / 1e18).toFixed(4), [tx.tx.value]);
	const subPoolMarkers = useMemo(() => getSubPoolMarkers(tx.order), [tx.order]);
	const transactionType = useMemo(() => getTransactionType(tx?.tx?.type), [tx?.tx?.type]);

	return (
		<div style={{ ...style, height: "auto" }}>
			<Paper style={{ padding: "12px", marginBottom: "4px" }}>
				<Grid
					container
					spacing={1}
				>
					<Grid
						item
						xs={12}
					>
						<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
							<Chip
								label={"Type: " + transactionType}
								size="small"
								color={"primary"}
								variant="outlined"
							/>
							<Chip
								label={"Pool: " + tx.pool || "Deleted"}
								size="small"
								color={tx.pool ? "primary" : "error"}
								variant="outlined"
							/>
							{subPoolMarkers.map((marker, idx) => (
								<Chip
									key={idx}
									label={marker}
									size="small"
									color="primary"
									variant="outlined"
									sx={{ fontFamily: "monospace" }}
								/>
							))}
						</div>
					</Grid>
					<Grid
						item
						xs={12}
						sm={12}
					>
						<Typography variant="body2">
							<strong>Hash:</strong> {"0x" + tx?.tx?.hash || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={6}
					>
						<Typography variant="body2">
							<strong>From:</strong> {tx?.tx?.from || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={6}
					>
						<Typography variant="body2">
							<strong>To:</strong> {tx?.tx?.to || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Nonce:</strong> {tx.tx.nonce}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Value:</strong> {value} ETH
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Gas Limit:</strong> {tx?.tx?.gasLimit?.toString() || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Gas Price:</strong> {tx?.tx?.gasPrice?.toString() || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Max Fee:</strong> {tx?.tx?.maxFeePerGas?.toString() || "N/A"}
						</Typography>
					</Grid>
					<Grid
						item
						xs={12}
						sm={2}
					>
						<Typography variant="body2">
							<strong>Max Priority Fee:</strong> {tx?.tx?.maxPriorityFeePerGas?.toString() || "N/A"}
						</Typography>
					</Grid>
					<DiscardReason reason={tx.discardReason} />
				</Grid>
			</Paper>
		</div>
	);
});
