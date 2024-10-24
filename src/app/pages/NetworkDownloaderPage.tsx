import { useSelector } from "react-redux";
import { useState } from "react";
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

	const renderContent = () => {
		if (showDetails === OverviewTableColumn[OverviewTableColumn.Peers]) {
			return (
				<Box
					sx={{
						maxHeight: "80vh",
						overflow: "auto"
					}}
				>
					<p>{showDetails}</p>
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
						overflow: "auto" // Enables vertical scrolling
					}}
				>
					<p>{showDetails}</p>
					<SegmentsTable
						segments={syncStatus.segments}
						segmentSelected={false}
						onSegmentClicked={() => {}}
					/>
				</Box>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Connections]) {
			let data = {
				xAxis: [{ data: syncStatus.diagramData.map((d) => d.time) }],
				series: [{ data: syncStatus.diagramData.map((d) => d.connections) }]
			};

			return renderChart(data, showDetails);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.DownloadRate]) {
			let data = {
				xAxis: [{ data: syncStatus.diagramData.map((d) => d.time) }],
				series: [{ data: syncStatus.diagramData.map((d) => d.downloadRate / 1024 / 1024) }]
			};

			return renderChart(data, showDetails + " (MB/s)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.UploadRate]) {
			let data = {
				xAxis: [{ data: syncStatus.diagramData.map((d) => d.time) }],
				series: [{ data: syncStatus.diagramData.map((d) => d.uploadRate / 1024 / 1024) }]
			};

			return renderChart(data, showDetails + " (MB/s)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Downloaded]) {
			let data = {
				xAxis: [{ data: syncStatus.diagramData.map((d) => d.time) }],
				series: [{ data: syncStatus.diagramData.map((d) => d.downloaded / 1024 / 1024) }]
			};

			return renderChart(data, showDetails + " (MB)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Total]) {
			let data = {
				xAxis: [{ data: syncStatus.diagramData.map((d) => d.time) }],
				series: [{ data: syncStatus.diagramData.map((d) => d.total / 1024 / 1024) }]
			};

			return renderChart(data, showDetails + " (MB)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Alloc]) {
			let data = {
				xAxis: [{ data: syncStatus.diagramData.map((d) => d.time) }],
				series: [{ data: syncStatus.diagramData.map((d) => d.alloc / 1024 / 1024 / 1024) }]
			};

			return renderChart(data, showDetails + " (GB)");
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Sys]) {
			let data = {
				xAxis: [{ data: syncStatus.diagramData.map((d) => d.time) }],
				series: [{ data: syncStatus.diagramData.map((d) => d.sys / 1024 / 1024 / 1024) }]
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
					overflow: "auto" // Enables vertical scrolling
				}}
			>
				<p>{title}</p>
				<LineChart
					sx={{ width: "100%" }}
					xAxis={data.xAxis}
					series={data.series}
					height={250}
					margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
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
