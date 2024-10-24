import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import {
	bytesToSpeedPerSecond,
	calculatePercentDownloaded,
	clculateDownloadTimeLeft,
	multipleBytes,
	secondsToHms
} from "../../../helpers/converters";
import { selectSnapshotDownloadStatusesForNode } from "../../store/syncStagesSlice";
import { useSelector } from "react-redux";
import { useState } from "react";

export enum OverviewTableColumn {
	Name = 0,
	Status,
	Progress,
	Downloaded,
	Total,
	TimeLeft,
	TotalTime,
	DownloadRate,
	UploadRate,
	Peers,
	Files,
	Connections,
	Alloc,
	Sys
}

export interface DownloaderOverviewTableProps {
	onColumnClick: (column: OverviewTableColumn) => void;
}

export const DownloaderOverviewTable = ({ onColumnClick }: DownloaderOverviewTableProps) => {
	const syncStatus = useSelector(selectSnapshotDownloadStatusesForNode);

	const snapshotStatus = () => {
		if (!syncStatus.downloadFinished && syncStatus.indexed < 100 && syncStatus.torrentMetadataReady < syncStatus.files) {
			if (syncStatus.downloaded > 0) {
				return "downloading and waiting for metadata";
			} else {
				return "waiting for metadata";
			}
		} else if (!syncStatus.downloadFinished && syncStatus.indexed < 100) {
			return "Downloading";
		} else if (syncStatus.indexed < 100) {
			return "Indexing";
		} else {
			return "Finished";
		}
	};

	const totalTime = () => {
		let ttime = 0;
		syncStatus?.totalTime?.forEach((time) => {
			ttime += time;
		});
		return secondsToHms(ttime);
	};

	const [hoveredCell, setHoveredCell] = useState<OverviewTableColumn | null>(null);

	const handleHover = (column: OverviewTableColumn) => {
		setHoveredCell(column);
	};

	const handleMouseLeave = () => {
		setHoveredCell(null);
	};

	const handleClick = (column: OverviewTableColumn) => {
		onColumnClick(column);
	};

	const renderHeaderCell = (column: OverviewTableColumn) => {
		return <TableCell sx={{ fontWeight: "bold" }}>{OverviewTableColumn[column]}</TableCell>;
	};

	const renderHowerableCell = (column: OverviewTableColumn, value: string) => {
		return renderCell(column, value, true);
	};

	const renderNonHoverableCell = (column: OverviewTableColumn, value: string) => {
		return renderCell(column, value, false);
	};

	const renderCell = (column: OverviewTableColumn, value: string, hoverable: boolean) => {
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
						{renderHeaderCell(OverviewTableColumn.Name)}
						{renderHeaderCell(OverviewTableColumn.Status)}
						{renderHeaderCell(OverviewTableColumn.Progress)}
						{renderHeaderCell(OverviewTableColumn.Downloaded)}
						{renderHeaderCell(OverviewTableColumn.Total)}
						{renderHeaderCell(OverviewTableColumn.TimeLeft)}
						{renderHeaderCell(OverviewTableColumn.TotalTime)}
						{renderHeaderCell(OverviewTableColumn.DownloadRate)}
						{renderHeaderCell(OverviewTableColumn.UploadRate)}
						{renderHeaderCell(OverviewTableColumn.Peers)}
						{renderHeaderCell(OverviewTableColumn.Files)}
						{renderHeaderCell(OverviewTableColumn.Connections)}
						{renderHeaderCell(OverviewTableColumn.Alloc)}
						{renderHeaderCell(OverviewTableColumn.Sys)}
					</TableRow>
				</TableHead>
				<TableBody>
					<TableRow>
						{renderNonHoverableCell(OverviewTableColumn.Name, "Snapshots")}
						{renderNonHoverableCell(OverviewTableColumn.Status, snapshotStatus())}
						{renderNonHoverableCell(OverviewTableColumn.Progress, calculatePercentDownloaded(syncStatus.downloaded, syncStatus.total))}
						{renderHowerableCell(OverviewTableColumn.Downloaded, multipleBytes(syncStatus.downloaded))}
						{renderHowerableCell(OverviewTableColumn.Total, multipleBytes(syncStatus.total))}
						{renderNonHoverableCell(
							OverviewTableColumn.TimeLeft,
							clculateDownloadTimeLeft(syncStatus.downloaded, syncStatus.total, syncStatus.downloadRate)
						)}
						{renderNonHoverableCell(OverviewTableColumn.TotalTime, totalTime())}
						{renderHowerableCell(OverviewTableColumn.DownloadRate, bytesToSpeedPerSecond(syncStatus.downloadRate))}
						{renderHowerableCell(OverviewTableColumn.UploadRate, bytesToSpeedPerSecond(syncStatus.uploadRate))}
						{renderHowerableCell(OverviewTableColumn.Peers, syncStatus?.peers?.toString() || "0")}
						{renderHowerableCell(OverviewTableColumn.Files, syncStatus?.files?.toString() || "0")}
						{renderHowerableCell(OverviewTableColumn.Connections, syncStatus?.connections?.toString() || "0")}
						{renderHowerableCell(OverviewTableColumn.Alloc, multipleBytes(syncStatus.alloc))}
						{renderHowerableCell(OverviewTableColumn.Sys, multipleBytes(syncStatus.sys))}
					</TableRow>
				</TableBody>
			</Table>
		</TableContainer>
	);
};
