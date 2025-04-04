import { useSelector } from "react-redux";
import { useState } from "react";
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
import { PeerDetails } from "../components/PeersStatistics/PeerDetails";
import { TimeChart } from "../components/Charts/TimeChart";

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
			return (
				<TimeChart
					valueData={diagramData.map((d) => d.inRate)}
					timeData={diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === TableColumn[TableColumn.NetworkIn]) {
			return (
				<TimeChart
					valueData={diagramData.map((d) => d.networkIn)}
					timeData={diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === TableColumn[TableColumn.OutRate]) {
			return (
				<TimeChart
					valueData={diagramData.map((d) => d.outRate)}
					timeData={diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === TableColumn[TableColumn.NetworkOut]) {
			return (
				<TimeChart
					valueData={diagramData.map((d) => d.totalNetwork)}
					timeData={diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		} else if (showDetails === TableColumn[TableColumn.TotalNetwork]) {
			return (
				<TimeChart
					valueData={diagramData.map((d) => d.totalNetwork)}
					timeData={diagramData.map((d) => d.time)}
					title={showDetails}
				/>
			);
		}
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
