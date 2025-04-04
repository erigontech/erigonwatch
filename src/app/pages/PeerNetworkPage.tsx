import { useSelector } from "react-redux";
import { useState, useCallback, useMemo } from "react";
import {
	Peer,
	PeersStatistics,
	selectNetworkDiagramDataForNode,
	selectSentinelActivePeersForNode,
	selectSentinelPeersForNode,
	selectSentinelPeersStatistics,
	selectSentinelStaticPeersForNode,
	selectSentryActivePeersForNode,
	selectSentryPeersForNode,
	selectSentryPeersStatistics,
	selectSentryStaticPeersForNode
} from "../store/networkSlice";
import { Accordion, AccordionDetails, AccordionSummary, Box, Modal, Typography } from "@mui/material";
import { PeersStatisticsTable, TableColumn } from "../components/PeersStatistics/PeersStatisticsTable";
import { PeersDetailsTable } from "../components/PeersStatistics/PeerDetailsTable";
import { LineChart } from "@mui/x-charts";
import { LineChartData } from "../components/SyncStages/TorrentPeerHistory";
import { PeerDetails } from "../components/PeersStatistics/PeerDetails";

export interface ChartData {
	x: number;
	y: number;
}

export enum PeersStatisticsType {
	Active = "active",
	Static = "static",
	Total = "total",
	Errors = "errors",
	Network = "network",
	None = "none"
}

export interface PeerNetworkPageProps {
	type: string;
}

export const PeerNetworkPage = ({ type }: PeerNetworkPageProps) => {
	let peers: Peer[] = [];
	let statistics: PeersStatistics = {
		activePeers: 0,
		totalPeers: 0,
		staticPeers: 0,
		totalErrors: 0,
		totalInBytes: 0,
		totalOutBytes: 0,
		totalInRate: 0,
		totalOutRate: 0
	};
	let activePeers: Peer[] = [];
	let staticPeers: Peer[] = [];
	if (type === "sentry") {
		peers = useSelector(selectSentryPeersForNode);
		statistics = useSelector(selectSentryPeersStatistics);
		activePeers = useSelector(selectSentryActivePeersForNode);
		staticPeers = useSelector(selectSentryStaticPeersForNode);
	} else {
		peers = useSelector(selectSentinelPeersForNode);
		statistics = useSelector(selectSentinelPeersStatistics);
		activePeers = useSelector(selectSentinelActivePeersForNode);
		staticPeers = useSelector(selectSentinelStaticPeersForNode);
	}

	const diagramData = useSelector(selectNetworkDiagramDataForNode);

	const [showDetails, setShowDetails] = useState("");

	const [selectedPeer, setSelectedPeer] = useState<string | null>(null);

	// Sample data to reduce number of points
	const sampleData = useCallback((data: number[], timeData: number[], maxPoints: number = 100) => {
		if (data.length <= maxPoints) return { data, timeData };

		const step = Math.ceil(data.length / maxPoints);
		const sampledData: number[] = [];
		const sampledTime: number[] = [];

		for (let i = 0; i < data.length; i += step) {
			// Calculate average for this window
			let sum = 0;
			let count = 0;
			for (let j = i; j < Math.min(i + step, data.length); j++) {
				sum += data[j];
				count++;
			}
			sampledData.push(sum / count);
			sampledTime.push(timeData[i]);
		}

		return { data: sampledData, timeData: sampledTime };
	}, []);

	// Memoize chart configurations
	const chartConfig = useMemo(
		() => ({
			slotProps: {
				legend: {
					direction: "row" as const,
					position: { vertical: "top" as const, horizontal: "right" as const },
					padding: 0
				}
			}
		}),
		[]
	);

	const formatNetwork = useCallback((bytes: number) => {
		if (bytes >= 1 << 40) {
			return (bytes / (1 << 40)).toFixed(2) + " TB";
		} else if (bytes >= 1 << 30) {
			return (bytes / (1 << 30)).toFixed(2) + " GB";
		} else if (bytes >= 1 << 20) {
			return (bytes / (1 << 20)).toFixed(2) + " MB";
		} else if (bytes >= 1 << 10) {
			return (bytes / (1 << 10)).toFixed(2) + " KB";
		} else {
			return bytes.toFixed(2) + " B";
		}
	}, []);

	const formatRate = useCallback((bytesPerSec: number) => {
		if (bytesPerSec >= 1 << 40) {
			return (bytesPerSec / (1 << 40)).toFixed(2) + " TB/s";
		} else if (bytesPerSec >= 1 << 30) {
			return (bytesPerSec / (1 << 30)).toFixed(2) + " GB/s";
		} else if (bytesPerSec >= 1 << 20) {
			return (bytesPerSec / (1 << 20)).toFixed(2) + " MB/s";
		} else if (bytesPerSec >= 1 << 10) {
			return (bytesPerSec / (1 << 10)).toFixed(2) + " KB/s";
		} else {
			return bytesPerSec.toFixed(2) + " B/s";
		}
	}, []);

	const axisConfig = useMemo(
		() => ({
			xAxis: [
				{
					label: "Time (seconds)",
					labelStyle: { fontSize: 14 }
				}
			],
			rateYAxis: [
				{
					label: "Rate (bytes/s)",
					labelStyle: { fontSize: 14 },
					valueFormatter: (value: number | null) => {
						if (value === null || value === undefined) return "0 B/s";
						return formatRate(value);
					}
				}
			],
			networkYAxis: [
				{
					label: "Network Traffic (bytes)",
					labelStyle: { fontSize: 14 },
					valueFormatter: (value: number | null) => {
						if (value === null || value === undefined) return "0 B";
						return formatNetwork(value);
					}
				}
			]
		}),
		[formatNetwork, formatRate]
	);

	const renderPeersErrorsTable = () => {
		return (
			<table className="table-fixed rounded-lg shadow-lg bg-white text-left mb-4 w-full h-fit">
				<thead>
					<tr className="border-b">
						<th className="px-4 py-2">Error</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
		);
	};

	const renderContent = () => {
		if (
			showDetails === TableColumn[TableColumn.Active] ||
			showDetails === TableColumn[TableColumn.Static] ||
			showDetails === TableColumn[TableColumn.TotalSeen]
		) {
			return (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column"
					}}
				>
					<Typography
						variant="h6"
						gutterBottom
					>
						{showDetails}
					</Typography>
					<PeersDetailsTable
						peers={
							showDetails === TableColumn[TableColumn.Active] ? activePeers : showDetails === TableColumn[TableColumn.Static] ? staticPeers : peers
						}
						onPeerClicked={(peer: string) => {
							setSelectedPeer(peer);
						}}
					/>
				</Box>
			);
		} else if (showDetails === TableColumn[TableColumn.InRate]) {
			const sampledData = sampleData(
				diagramData.map((d) => d.inRate),
				diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails);
		} else if (showDetails === TableColumn[TableColumn.NetworkIn]) {
			const sampledData = sampleData(
				diagramData.map((d) => d.networkIn),
				diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails);
		} else if (showDetails === TableColumn[TableColumn.OutRate]) {
			const sampledData = sampleData(
				diagramData.map((d) => d.outRate),
				diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails);
		} else if (showDetails === TableColumn[TableColumn.NetworkOut]) {
			const sampledData = sampleData(
				diagramData.map((d) => d.networkOut),
				diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails);
		} else if (showDetails === TableColumn[TableColumn.TotalNetwork]) {
			const sampledData = sampleData(
				diagramData.map((d) => d.totalNetwork),
				diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails);
		}
	};

	const renderChart = (data: LineChartData, title: string) => {
		return (
			<Box
				sx={{
					maxHeight: "80vh",
					overflow: "auto"
				}}
			>
				<Typography
					variant="h6"
					gutterBottom
				>
					{title}
				</Typography>
				<LineChart
					sx={{ width: "100%" }}
					height={250}
					margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
					xAxis={axisConfig.xAxis.map((axis) => ({
						...axis,
						data: data.xAxis[0].data,
						valueFormatter: (value) => {
							const formatTime = (value: number): string => {
								if (value === 0) return "Time: 0s";

								const hours = Math.floor(value / 3600);
								const minutes = Math.floor((value % 3600) / 60);
								const seconds = value % 60;

								if (hours > 0) {
									return `${hours}h ${minutes}m ${seconds}s`;
								} else if (minutes > 0) {
									return `${minutes}m ${seconds}s`;
								} else {
									return `${seconds}s`;
								}
							};

							return formatTime(value);
						}
					}))}
					yAxis={title.includes("Network") ? axisConfig.networkYAxis : axisConfig.rateYAxis}
					series={[
						{
							...data.series[0],
							valueFormatter: (value) => {
								if (!value) return "0 bytes/s";
								const unit = title.includes("Rate") ? "bytes/s" : "bytes";
								if (title.includes("Rate")) {
									return formatRate(value);
								} else {
									return formatNetwork(value);
								}
							},
							label: title
						}
					]}
					{...chartConfig}
				/>
			</Box>
		);
	};

	const [expanded, setExpanded] = useState<string | false>(false);

	const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);

		if (!isExpanded) {
			setSelectedPeer(null);
		}
	};

	const style = {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		maxWidth: "80%",
		bgcolor: "background.paper",
		border: "2px solid #000",
		boxShadow: 24,
		p: 4
	};

	return (
		<Box
			sx={{
				display: "flex", // Enables Flexbox
				flexDirection: "column", // Stacks items vertically
				alignItems: "center", // Centers items vertically
				height: "100vh", // Full viewport height to center content vertically
				width: "100%", // maxWidth of the Box
				border: "1px solid black", // Optional: just to show the boundaries of the Box
				overflow: "auto", // Enables vertical scrolling
				paddingBottom: "50px" // Centers the Box horizontally
			}}
		>
			<Accordion
				sx={{ padding: "0px", width: "100%", marginBottom: "10px" }}
				expanded={expanded === "panel2"}
				onChange={handleChange("panel2")}
			>
				<AccordionSummary>
					<PeersStatisticsTable
						statistics={statistics}
						onColumnClick={(column: TableColumn) => {
							if (showDetails === "") {
								setShowDetails(TableColumn[column]);
							} else {
								setShowDetails("");
							}
						}}
					/>
				</AccordionSummary>
				<AccordionDetails>{renderContent()}</AccordionDetails>
			</Accordion>

			<Modal
				open={selectedPeer !== null}
				onClose={() => {
					setSelectedPeer(null);
				}}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<PeerDetails peerId={selectedPeer || ""} />
				</Box>
			</Modal>
		</Box>
	);
};
