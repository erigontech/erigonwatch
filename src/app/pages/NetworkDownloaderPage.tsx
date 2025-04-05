import { useSelector } from "react-redux";
import { useState, useCallback, useMemo, useEffect } from "react";
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
import { TimeChart } from "../components/Charts/TimeChart";
import { getNodeFlags } from "../../Network/APIGateway";

export const NetworkDownloaderPage = () => {
	const syncStatus = useSelector(selectSnapshotDownloadStatusesForNode);
	const [showDetails, setShowDetails] = useState("");
	const allFlags = useSelector(selectFlagsForNode);
	const issues = useSelector(selectNetworkSpeedIssues);
	const navigate = useNavigate();
	const handleIssuesClick = () => navigate("/issues");
	const peers = useSelector(selectTorrrentPeersForNode);

	useEffect(() => {
		if (!allFlags || allFlags.length === 0) {
			getNodeFlags();
		}
	}, [allFlags]);

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
			return (
				<TimeChart
					valueData={syncStatus.diagramData.map((d) => d.connections)}
					timeData={syncStatus.diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.DownloadRate]) {
			return (
				<TimeChart
					valueData={syncStatus.diagramData.map((d) => d.downloadRate)}
					timeData={syncStatus.diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.UploadRate]) {
			return (
				<TimeChart
					valueData={syncStatus.diagramData.map((d) => d.uploadRate)}
					timeData={syncStatus.diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Downloaded]) {
			return (
				<TimeChart
					valueData={syncStatus.diagramData.map((d) => d.downloaded)}
					timeData={syncStatus.diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Total]) {
			return (
				<TimeChart
					valueData={syncStatus.diagramData.map((d) => d.total)}
					timeData={syncStatus.diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Alloc]) {
			return (
				<TimeChart
					valueData={syncStatus.diagramData.map((d) => d.alloc)}
					timeData={syncStatus.diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === OverviewTableColumn[OverviewTableColumn.Sys]) {
			return (
				<TimeChart
					valueData={syncStatus.diagramData.map((d) => d.sys)}
					timeData={syncStatus.diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else {
			return "Not implemented";
		}
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
