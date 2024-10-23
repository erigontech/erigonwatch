import { useEffect, useState } from "react";
import { multipleBytes, PeerIdToString } from "../../../helpers/converters";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SortIcon from "@mui/icons-material/Sort";
import { SegmentPeer, SegmentPeerDiagData, selectSegmentPeersDiagDataForNode } from "../../store/syncStagesSlice";
import { Box, Modal, Typography } from "@mui/material";
import { TorrentPeersHistory } from "./TorrentPeerHistory";
import { useSelector } from "react-redux";

enum SortColumn {
	Url = "Url",
	DlRate = "DlRate",
	UlRate = "UlRate",
	Address = "Address",
	ID = "ID",
	PiecesCount = "PiecesCount",
	Torrents = "Torrents"
}

interface SortState {
	column: SortColumn;
	descending: boolean;
}

export interface TorrentPeersTableProps {
	peers: SegmentPeer[];
	peerSelected: boolean;
	onPeerClicked: (segment: SegmentPeer) => void;
}

interface DisplayPeers {
	url: string;
	downloadRate: number;
	uploadRate: number;
	remoteAddr: string;
	peerId: number[];
	piecesCount: number;
	torrents: string[];
}

export const TorrentPeersTable = ({ peers, peerSelected, onPeerClicked }: TorrentPeersTableProps) => {
	const displayPeers = (peers: SegmentPeer[]): DisplayPeers[] => {
		let displayPeers: DisplayPeers[] = [];
		peers.forEach((peer) => {
			let displayPeer = displayPeers.find((p) => p.peerId.toString() === peer.peerId.toString());
			if (displayPeer) {
				displayPeer.downloadRate += peer.downloadRate;
				displayPeer.uploadRate += peer.uploadRate;
				displayPeer.piecesCount += peer.piecesCount;
				displayPeer.torrents.push(peer.torrentName);
			} else {
				displayPeers.push({
					url: peer.url,
					downloadRate: peer.downloadRate,
					uploadRate: peer.uploadRate,
					remoteAddr: peer.remoteAddr,
					peerId: peer.peerId,
					piecesCount: peer.piecesCount,
					torrents: [peer.torrentName]
				});
			}
		});
		return displayPeers;
	};

	const [visibleSegments, setVisibleSegments] = useState<DisplayPeers[]>([]);

	const [currentSortState, setCurrentSortState] = useState<SortState>({
		column: SortColumn.Url,
		descending: true
	});

	const sortSegments = (seg: DisplayPeers[], sotOpt: SortState): void => {
		console.log("sortSegments", seg[0]);
		let tosort = [...seg];
		let sortedSegments = tosort.sort((a, b) => {
			if (sotOpt.column === SortColumn.Url) {
				return compareStrings(a.url, b.url, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.DlRate) {
				return compareNumbers(a.downloadRate, b.downloadRate, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.UlRate) {
				return compareNumbers(a.uploadRate, b.uploadRate, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.PiecesCount) {
				return compareNumbers(a.piecesCount, b.piecesCount, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Address) {
				return compareStrings(a.remoteAddr, b.remoteAddr, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.ID) {
				return compareStrings(PeerIdToString(a.peerId), PeerIdToString(b.peerId), sotOpt.descending);
			} else {
				return compareNumbers(a.torrents.length, b.torrents.length, sotOpt.descending);
			}
		});

		setCurrentSortState(sotOpt);
		setVisibleSegments(sortedSegments);
	};

	const compareStrings = (a: string, b: string, desc: boolean) => {
		if (desc) {
			return b.localeCompare(a);
		} else {
			return a.localeCompare(b);
		}
	};

	const compareNumbers = (a: number, b: number, desc: boolean) => {
		if (desc) {
			return b - a;
		} else {
			return a - b;
		}
	};

	const getArrowIcon = (column: SortColumn) => {
		if (currentSortState.column !== column) {
			return <SortIcon className="ml-2" />;
		} else {
			if (currentSortState.descending) {
				return <ArrowDropDownIcon />;
			} else {
				return <ArrowDropUpIcon />;
			}
		}
	};

	const [peer, setPeer] = useState<SegmentPeerDiagData | undefined>(undefined);
	const handleOpen = (peer: SegmentPeerDiagData) => setPeer(peer);
	const handleClose = () => setPeer(undefined);

	useEffect(() => {
		if (peer) {
			peers.forEach((p) => {
				if (p.peerId.toString() === peer.peerId) {
					findPeerById(p.peerId.toString());
					return;
				}
			});
		}
	}, [peers]);

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

	useEffect(() => {
		sortSegments(displayPeers(peers), currentSortState);
	}, [peers]);

	const perrsdiagData = useSelector(selectSegmentPeersDiagDataForNode);

	const findPeerById = (peerId: string) => {
		let result = perrsdiagData.find((peer) => {
			return peer.peerId === peerId;
		});

		if (result) {
			handleOpen(result);
		}
	};

	const convertPid = (pid: string, short: boolean): string => {
		let arr = pid.split(",");
		let nums = arr.map((num) => parseInt(num));
		let res = PeerIdToString(nums);
		let result = res;

		if (short) {
			let charsArray = res.split("");
			if (charsArray.length > 10) {
				result = res.slice(0, 4) + "..." + res.slice(-4);
			}
		}

		return result;
	};

	return (
		<div
			className="w-full h-[95%]"
			style={{ overflowY: !peerSelected ? "scroll" : "hidden" }}
		>
			<table className="table-fixed text-left w-full">
				<thead>
					<tr className="border-b">
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.Url,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								URL
								{getArrowIcon(SortColumn.Url)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.DlRate,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Download Rate
								{getArrowIcon(SortColumn.DlRate)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.UlRate,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Upload Rate
								{getArrowIcon(SortColumn.UlRate)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.Address,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Remote Address
								{getArrowIcon(SortColumn.Address)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.ID,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								ID
								{getArrowIcon(SortColumn.ID)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.PiecesCount,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Pieces Count
								{getArrowIcon(SortColumn.PiecesCount)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.Torrents,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Torrents Count
								{getArrowIcon(SortColumn.Torrents)}
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{visibleSegments.map((peer) => {
						return (
							<tr
								key={uniqueId()}
								className="border-b hover:bg-gray-100 cursor-pointer"
								onClick={() => {
									findPeerById(peer.peerId.toString());
								}}
							>
								<td className="px-4 py-2">{peer.url}</td>
								<td className="px-4 py-2">{multipleBytes(peer.downloadRate)}</td>
								<td className="px-4 py-2">{multipleBytes(peer.uploadRate)}</td>
								<td className="px-4 py-2">{peer.remoteAddr}</td>
								<td className="px-4 py-2">{PeerIdToString(peer.peerId)}</td>
								<td className="px-4 py-2">{peer.piecesCount}</td>
								<td className="px-4 py-2">{peer.torrents.length}</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			<Modal
				open={peer !== undefined}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={style}>
					<Typography
						id="modal-modal-title"
						variant="h6"
						component="h2"
					>
						{peer ? "Peer ID: " + convertPid(peer.peerId, true) : "Peer ID: unknown"}
					</Typography>
					<TorrentPeersHistory
						peer={
							peer || {
								peerId: "",
								diagramData: []
							}
						}
					/>
				</Box>
			</Modal>
		</div>
	);

	function uniqueId() {
		return Math.random().toString(36).substr(2, 9);
	}
};
