import { useEffect, useState } from "react";
import { multipleBytes, PeerIdToString } from "../../../helpers/converters";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SortIcon from "@mui/icons-material/Sort";
import { SegmentPeer } from "../../store/syncStagesSlice";

enum SortColumn {
	Url = "Url",
	DlRate = "DlRate",
	Address = "Address",
	ID = "ID",
	PiecesCount = "PiecesCount",
	TorrentName = "TorrentName"
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
	remoteAddr: string;
	peerId: number[];
	piecesCount: number;
	torrents: string[];
}

export const TorrentPeersTable = ({ peers, peerSelected, onPeerClicked }: TorrentPeersTableProps) => {
	const findSegmentPeerFromDisplayPeer = (peer: DisplayPeers): SegmentPeer => {
		let segmentPeer = peers.find((p) => p.url === peer.url);
		if (segmentPeer) {
			return segmentPeer;
		} else {
			return {
				url: peer.url,
				downloadRate: peer.downloadRate,
				remoteAddr: peer.remoteAddr,
				peerId: peer.peerId,
				piecesCount: peer.piecesCount,
				torrentName: peer.torrents[0]
			};
		}
	};

	const displayPeers = (peers: SegmentPeer[]): DisplayPeers[] => {
		let displayPeers: DisplayPeers[] = [];
		peers.forEach((peer) => {
			let displayPeer = displayPeers.find((p) => p.url === peer.url);
			if (displayPeer) {
				displayPeer.downloadRate += peer.downloadRate;
				displayPeer.piecesCount += peer.piecesCount;
				displayPeer.torrents.push(peer.torrentName);
			} else {
				displayPeers.push({
					url: peer.url,
					downloadRate: peer.downloadRate,
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
			} else if (sotOpt.column === SortColumn.PiecesCount) {
				return compareNumbers(a.piecesCount, b.piecesCount, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Address) {
				return compareStrings(a.remoteAddr, b.remoteAddr, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.ID) {
				return compareStrings(PeerIdToString(a.peerId), PeerIdToString(b.peerId), sotOpt.descending);
			} else {
				//return compareStrings(a.torrentName, b.torrentName, sotOpt.descending);
				return 0;
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

	useEffect(() => {
		sortSegments(displayPeers(peers), currentSortState);
	}, [peers]);

	return (
		<div
			className="w-full h-[95%]"
			style={{ overflowY: !peerSelected ? "scroll" : "hidden" }}
		>
			<table className="table-fixed text-left">
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
									column: SortColumn.TorrentName,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Torrent Name
								{getArrowIcon(SortColumn.TorrentName)}
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
									onPeerClicked(findSegmentPeerFromDisplayPeer(peer));
								}}
							>
								<td className="px-4 py-2">{peer.url}</td>
								<td className="px-4 py-2">{multipleBytes(peer.downloadRate)}</td>
								<td className="px-4 py-2">{peer.remoteAddr}</td>
								<td className="px-4 py-2">{PeerIdToString(peer.peerId)}</td>
								<td className="px-4 py-2">{peer.piecesCount}</td>
								<td className="px-4 py-2">{"peer.torrentName"}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);

	function uniqueId() {
		return Math.random().toString(36).substr(2, 9);
	}
};
