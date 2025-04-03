import { useSelector } from "react-redux";
import { useState, useCallback, useMemo } from "react";
import { selectSnapshotDownloadStatusesForNode, selectTorrrentPeersForNode } from "../store/syncStagesSlice";
import { selectFlagsForNode } from "../store/appSlice";
import { FlagsDetailsTable } from "../components/Flags/FlagsDetailsTable";
import { downloaderFlags } from "../components/Flags/flagConstants";
import { selectNetworkSpeedIssues } from "../store/issuesSlice";
import { useNavigate } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DownloaderOverviewTable, OverviewTableColumn } from "../components/Downloader/DownloaderOverviewTable";
import { TorrentPeersTable } from "../components/SyncStages/TorrentPeersTable";
import { SegmentsTable } from "../components/SyncStages/SegmentsTable";
import { LineChart } from "@mui/x-charts";
import { LineChartData } from "../components/SyncStages/TorrentPeerHistory";

export const NetworkDownloaderPage = () => {
	const syncStatus = useSelector(selectSnapshotDownloadStatusesForNode);
	const [showDetails, setShowDetails] = useState("");
	const allFlags = useSelector(selectFlagsForNode);
	const issues = useSelector(selectNetworkSpeedIssues);
	const navigate = useNavigate();
	const handleIssuesClick = () => navigate("/issues");
	const peers = useSelector(selectTorrrentPeersForNode);

	const flags = allFlags.filter((flag) => {
		return downloaderFlags.includes(flag.flag);
	});

	const renderTotalsTable = () => {
		return (
			<DownloaderOverviewTable
				onColumnClick={(column) => {
					if (showDetails === "") {
						setShowDetails(OverviewTableColumn[column]);
					} else {
						setShowDetails("");
					}
				}}
			/>
		);
	};

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
					label: "Rate (MB/s)",
					labelStyle: { fontSize: 14 },
					labelFormat: (value: number | null) => {
						if (!value) return "Rate (GB/s)";
						if (value > 1024 * 1024) {
							return `Rate MB/s`;
						}
						return `Rate B/s`;
					}
				}
			],
			sizeYAxis: [
				{
					label: "Size (MB)",
					labelStyle: { fontSize: 14 }
				}
			],
			connectionsYAxis: [
				{
					label: "Number of Connections",
					labelStyle: { fontSize: 14 }
				}
			]
		}),
		[]
	);

	const renderContent = () => {
		if (showDetails === OverviewTableColumn[OverviewTableColumn.Peers]) {
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
						{showDetails}
					</Typography>
					<TorrentPeersTable
						peers={peers}
						peerSelected={false}
						onPeerClicked={() => {}}
					/>
				</Box>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Files]) {
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
						{showDetails}
					</Typography>
					<SegmentsTable
						segments={syncStatus.segments}
						segmentSelected={false}
						onSegmentClicked={() => {}}
					/>
				</Box>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Connections]) {
			const sampledData = sampleData(
				syncStatus.diagramData.map((d) => d.connections),
				syncStatus.diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.DownloadRate]) {
			const sampledData = sampleData(
				syncStatus.diagramData.map((d) => d.downloadRate / 1024 / 1024),
				syncStatus.diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails + " (MB/s)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.UploadRate]) {
			const sampledData = sampleData(
				syncStatus.diagramData.map((d) => d.uploadRate / 1024 / 1024),
				syncStatus.diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails + " (MB/s)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Downloaded]) {
			const sampledData = sampleData(
				syncStatus.diagramData.map((d) => d.downloaded / 1024 / 1024),
				syncStatus.diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails + " (MB)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Total]) {
			const sampledData = sampleData(
				syncStatus.diagramData.map((d) => d.total / 1024 / 1024),
				syncStatus.diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails + " (MB)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Alloc]) {
			const sampledData = sampleData(
				syncStatus.diagramData.map((d) => d.alloc / 1024 / 1024 / 1024),
				syncStatus.diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails + " (GB)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Sys]) {
			const sampledData = sampleData(
				syncStatus.diagramData.map((d) => d.sys / 1024 / 1024 / 1024),
				syncStatus.diagramData.map((d) => d.time)
			);
			let data = {
				xAxis: [{ data: sampledData.timeData }],
				series: [{ data: sampledData.data }]
			};
			return renderChart(data, showDetails + " (GB)");
		} else {
			return "Not implemented";
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
					yAxis={axisConfig.rateYAxis}
					series={[
						{
							...data.series[0],
							valueFormatter: (value) => {
								const unit = title.includes("GB") ? "GB/s" : "MB/s";
								return value ? `${value.toFixed(2)} ${unit}` : `0 ${unit}`;
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
			setShowDetails("");
		}
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
			{issues.length > 0 && (
				<p
					className="font-bold mt-5 mb-5 text-yellow-400 cursor-pointer"
					onClick={handleIssuesClick}
				>
					{"Found " + issues.length + " download speed issues"}
				</p>
			)}

			<Accordion
				sx={{ padding: "0px", width: "100%", marginBottom: "10px" }}
				expanded={expanded === "panel2"}
				onChange={handleChange("panel2")}
			>
				<AccordionSummary>{renderTotalsTable()}</AccordionSummary>
				<AccordionDetails>{renderContent()}</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1-content"
					id="panel1-header"
					sx={{
						fontWeight: "bold",
						width: "100%"
					}}
				>
					Downloader flags
				</AccordionSummary>
				<AccordionDetails>
					<FlagsDetailsTable flags={flags} />
				</AccordionDetails>
			</Accordion>
		</Box>
	);
};
