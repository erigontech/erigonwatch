import { useEffect, useState } from "react";
import { multipleBps, multipleBytes } from "../../../helpers/converters";
import { Peer } from "../../store/networkSlice";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SortIcon from "@mui/icons-material/Sort";

enum SortColumn {
	Id = "Id",
	Type = "Type",
	Status = "Status",
	TotalIn = "TotalIn",
	TotalOut = "TotalOut",
	InSpeed = "InSpeed",
	OutSpeed = "OutSpeed"
}

interface SortState {
	column: SortColumn;
	descending: boolean;
}

export interface PeersDetailsTableProps {
	peers: Peer[];
	onPeerClicked: (peer: string) => void;
}

export const PeersDetailsTable = ({ peers, onPeerClicked }: PeersDetailsTableProps) => {
	const [visiblePeers, setVisiblePeers] = useState<Peer[]>(peers);

	const [currentSortState, setCurrentSortState] = useState<SortState>({
		column: SortColumn.Type,
		descending: true
	});

	useEffect(() => {
		sortPeers(peers, currentSortState);
	}, [peers]);

	const sortPeers = (prs: Peer[], sotOpt: SortState): void => {
		let sortedPeers = prs.sort((a, b) => {
			if (sotOpt.column === SortColumn.Id) {
				return compareStrings(a.id, b.id, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Type) {
				return compareStrings(a.type, b.type, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Status) {
				return compareStrings(a.active.toString(), b.active.toString(), sotOpt.descending);
			} else if (sotOpt.column === SortColumn.TotalIn) {
				return compareNumbers(a.network.bytesIn, b.network.bytesIn, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.TotalOut) {
				return compareNumbers(a.network.bytesOut, b.network.bytesOut, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.InSpeed) {
				return compareNumbers(a.network.inRate, b.network.inRate, sotOpt.descending);
			} else {
				return compareNumbers(a.network.outRate, b.network.outRate, sotOpt.descending);
			}
		});

		setCurrentSortState(sotOpt);
		setVisiblePeers(sortedPeers);
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

	const getPeerType = (peer: Peer) => {
		if (peer.network.static) {
			return "static";
		} else if (peer.network.bootnode) {
			return "bootnode";
		} else {
			return "dynamic";
		}
	};

	return (
		<div className="flex flex-col shadow-lg rounded-md p-2 bg-white min-h-[40px] max-h-[83vh] w-full overflow-auto">
			<table className="table-fixed text-left w-full">
				<thead>
					<tr className="border-b">
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortPeers(visiblePeers, {
									column: SortColumn.Id,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								peer ID
								{getArrowIcon(SortColumn.Id)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortPeers(visiblePeers, {
									column: SortColumn.Type,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Type
								{getArrowIcon(SortColumn.Type)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortPeers(visiblePeers, {
									column: SortColumn.Status,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Status
								{getArrowIcon(SortColumn.Status)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortPeers(visiblePeers, {
									column: SortColumn.TotalIn,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Total In
								{getArrowIcon(SortColumn.TotalIn)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortPeers(visiblePeers, {
									column: SortColumn.TotalOut,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Total Out
								{getArrowIcon(SortColumn.TotalOut)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortPeers(visiblePeers, {
									column: SortColumn.InSpeed,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								In Speed
								{getArrowIcon(SortColumn.InSpeed)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortPeers(visiblePeers, {
									column: SortColumn.OutSpeed,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Out Speed
								{getArrowIcon(SortColumn.OutSpeed)}
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{visiblePeers.map((peer, index) => {
						return (
							<tr
								className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
								key={index}
								onClick={() => {
									onPeerClicked(peer.id);
								}}
							>
								<td className="px-4 py-2 overflow-hidden text-ellipsis">{peer.id}</td>
								<td className="px-4 py-2 overflow-hidden text-ellipsis">{getPeerType(peer)}</td>
								<td className="px-4 py-2 overflow-hidden text-ellipsis">{peer.active ? "active" : ""}</td>
								<td className="px-4 py-2 overflow-hidden text-ellipsis">{multipleBytes(peer.network.bytesIn)}</td>
								<td className="px-4 py-2 overflow-hidden text-ellipsis">{multipleBytes(peer.network.bytesOut)}</td>
								<td className="px-4 py-2 overflow-hidden text-ellipsis">{multipleBps(peer.network.inRate)}</td>
								<td className="px-4 py-2 overflow-hidden text-ellipsis">{multipleBps(peer.network.outRate)}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
