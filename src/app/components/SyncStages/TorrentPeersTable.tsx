import { useState } from "react";
import { multipleBytes } from "../../../helpers/converters";
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

export const TorrentPeersTable = ({ peers, peerSelected, onPeerClicked }: TorrentPeersTableProps) => {
	const [visibleSegments, setVisibleSegments] = useState<SegmentPeer[]>(peers);

	const [currentSortState, setCurrentSortState] = useState<SortState>({
		column: SortColumn.Url,
		descending: true
	});

	const sortSegments = (seg: SegmentPeer[], sotOpt: SortState): void => {
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
				return compareStrings(bytesToString(a.peerId), bytesToString(b.peerId), sotOpt.descending);
			} else {
				return compareStrings(a.torrentName, b.torrentName, sotOpt.descending);
			}
		});

		console.log("sortedSegments", sortedSegments[0]);

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

	const bytesToString = (bts: number[]): string => {
		//let s = bytes.map((byte) => String.fromCharCode(byte)).join("");
		const bytes = new Uint8Array(bts);
		let res = toString(bytes);
		return res;
	};

	function toString(id: Uint8Array): string {
		// Equivalent of the Go code checking `me[0] == '-' && me[7] == '-'`
		if (id[0] === 45 && id[7] === 45) {
			// 45 is the ASCII code for '-'
			//return byteArrayToString(id.slice(0, 8)) + byteArrayToHex(id.slice(8));
			return byteArrayToHex(id.slice(8));
		}

		// Hex encoding of the entire array if no condition is met
		return byteArrayToHex(id);
	}

	// Helper function to convert byte array to string
	function byteArrayToString(bytes: Uint8Array): string {
		return new TextDecoder().decode(bytes);
	}

	// Helper function to convert byte array to hex string
	function byteArrayToHex(bytes: Uint8Array): string {
		return Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

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
								className="border-b"
							>
								<td className="px-4 py-2">{peer.url}</td>
								<td className="px-4 py-2">{multipleBytes(peer.downloadRate)}</td>
								<td className="px-4 py-2">{peer.remoteAddr}</td>
								<td className="px-4 py-2">{bytesToString(peer.peerId)}</td>
								<td className="px-4 py-2">{peer.piecesCount}</td>
								<td className="px-4 py-2">{peer.torrentName}</td>
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
