import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { multipleBytes } from "../../../helpers/converters";
import { PeersStatistics } from "../../store/networkSlice";
import { useState } from "react";

export enum TableColumn {
	Active = 0,
	Static,
	TotalSeen,
	InRate,
	NetworkIn,
	OutRate,
	NetworkOut,
	TotalNetwork
}

export interface PeersStatisticsTableProps {
	statistics: PeersStatistics;
	onColumnClick: (column: TableColumn) => void;
}

export const PeersStatisticsTable = ({ statistics, onColumnClick }: PeersStatisticsTableProps) => {
	const [hoveredCell, setHoveredCell] = useState<TableColumn | null>(null);

	const handleHover = (column: TableColumn) => {
		setHoveredCell(column);
	};

	const handleMouseLeave = () => {
		setHoveredCell(null);
	};

	const handleClick = (column: TableColumn) => {
		onColumnClick(column);
	};

	const renderHeaderCell = (column: TableColumn) => {
		return <TableCell sx={{ fontWeight: "bold" }}>{TableColumn[column]}</TableCell>;
	};

	const renderHowerableCell = (column: TableColumn, value: string) => {
		return renderCell(column, value, true);
	};

	const renderNonHoverableCell = (column: TableColumn, value: string) => {
		return renderCell(column, value, false);
	};

	const renderCell = (column: TableColumn, value: string, hoverable: boolean) => {
		return (
			<TableCell
				key={column}
				onMouseEnter={() => handleHover(column)}
				onMouseLeave={handleMouseLeave}
				onClick={() => handleClick(column)}
				sx={{
					cursor: hoverable ? "pointer" : "default",
					backgroundColor: hoverable ? (hoveredCell === column ? "#f0f0f0" : "inherit") : "inherit",
					transition: hoverable ? "background-color 0.3s" : "inherit"
				}}
			>
				{value}
			</TableCell>
		);
	};

	return (
		<TableContainer>
			<Table aria-label="simple table">
				<TableHead>
					<TableRow>
						{renderHeaderCell(TableColumn.Active)}
						{renderHeaderCell(TableColumn.Static)}
						{renderHeaderCell(TableColumn.TotalSeen)}
						{renderHeaderCell(TableColumn.InRate)}
						{renderHeaderCell(TableColumn.NetworkIn)}
						{renderHeaderCell(TableColumn.OutRate)}
						{renderHeaderCell(TableColumn.NetworkOut)}
						{renderHeaderCell(TableColumn.TotalNetwork)}
					</TableRow>
				</TableHead>
				<TableBody>
					<TableRow>
						{renderHowerableCell(TableColumn.Active, statistics.activePeers.toString())}
						{renderHowerableCell(TableColumn.Static, statistics.staticPeers.toString())}
						{renderHowerableCell(TableColumn.TotalSeen, statistics.totalPeers.toString())}
						{renderHowerableCell(TableColumn.InRate, multipleBytes(statistics.totalInRate))}
						{renderHowerableCell(TableColumn.NetworkIn, multipleBytes(statistics.totalInBytes))}
						{renderHowerableCell(TableColumn.OutRate, multipleBytes(statistics.totalOutRate))}
						{renderHowerableCell(TableColumn.NetworkOut, multipleBytes(statistics.totalOutBytes))}
						{renderHowerableCell(TableColumn.TotalNetwork, multipleBytes(statistics.totalInBytes + statistics.totalOutBytes))}
					</TableRow>
				</TableBody>
			</Table>
		</TableContainer>
	);
};
