import { useSelector } from "react-redux";
import { SnapshotDowndloadDetailsPopup } from "../components/SyncStages/SnapshotDowndloadDetailsPopup";
import { useState } from "react";
import { selectSegmentPeersDiagDataForNode, selectSnapshotDownloadStatusesForNode, selectTorrrentPeersForNode } from "../store/syncStagesSlice";
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

export const NetworkDownloaderPage = () => {
	const syncStatus = useSelector(selectSnapshotDownloadStatusesForNode);
	const peersDiagData = useSelector(selectSegmentPeersDiagDataForNode);
	const [showDetails, setShowDetails] = useState(false);
	const [showPeerDetail, setShowPeerDetails] = useState(false);
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
					console.log("colunm", column);
					if (column === OverviewTableColumn.Peers) {
						if (showPeerDetail) {
							setShowPeerDetails(false);
						} else {
							setShowPeerDetails(true);
						}
					}
				}}
			/>
		);
	};

	const renderContent = () => {
		if (showPeerDetail) {
			return (
				<TorrentPeersTable
					peers={peers}
					peerSelected={false}
					onPeerClicked={(peer) => {
						//let res = findPeerById(peer.peerId.toString());
						//console.log("res", res);
						//setSelectedPeer(res);
						console.log("peer clicked", peer);
					}}
				/>
			);
		} else {
			return "Not implemented";
		}
	};

	const [expanded, setExpanded] = useState<string | false>(false);

	// Function to handle accordion open/close
	const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);

		if (!isExpanded) {
			setShowPeerDetails(false);
			console.log("AccordionDetails closed!");
			// You can trigger any close event handling logic here.
		}
	};

	return (
		<Box
			sx={{
				display: "flex", // Enables Flexbox
				flexDirection: "column", // Stacks items vertically
				alignItems: "center", // Centers items vertically
				//justifyContent: "center", // Centers items horizontally
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
			{/*<ToggleButtonGroup
				color="primary"
				value={alignment}
				exclusive
				onChange={handleChange}
				aria-label="Platform"
			>
				<ToggleButton value="torrents">Torrents</ToggleButton>
				<ToggleButton value="peers">Peers</ToggleButton>
				<ToggleButton value="flags">Flags</ToggleButton>
			</ToggleButtonGroup>*/}
			{/*<button
				className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-5"
				onClick={() => setShowPeerDetails(true)}
			>
				{"Show Peers"}
			</button>*/}

			<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1-content"
					id="panel1-header"
					sx={{
						fontWeight: "bold",
						width: "100%" // maxWidth of the Box
					}}
				>
					Downloader flags
				</AccordionSummary>
				<AccordionDetails>
					<FlagsDetailsTable flags={flags} />
				</AccordionDetails>
			</Accordion>
			{/*<Accordion>
				<AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1-content"
					id="panel1-header"
					sx={{ fontWeight: "bold" }}
				>
					Peers
				</AccordionSummary>
				<AccordionDetails>
					<TorrentPeersTable
						peers={peers}
						peerSelected={false}
						onPeerClicked={(peer) => {}}
					/>
				</AccordionDetails>
			</Accordion>*/}
			{showDetails && (
				<SnapshotDowndloadDetailsPopup
					onClose={() => {
						setShowDetails(false);
					}}
				/>
			)}
			{/*showPeerDetail && (
				<TorrentPeersDetailsPopup
					onClose={() => {
						setShowPeerDetails(false);
					}}
				/>
			)*/}
		</Box>
	);
};
