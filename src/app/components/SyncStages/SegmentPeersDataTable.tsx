import { useEffect, useState } from "react";
import { multipleBytes } from "../../../helpers/converters";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SortIcon from "@mui/icons-material/Sort";
import { SegmentPeer } from "../../store/syncStagesSlice";

enum SortColumn {
	Url = "Url",
	Rate = "Rate"
}

interface SortState {
	column: SortColumn;
	descending: boolean;
}

export interface SegmentPeersDataTableProps {
	peers: SegmentPeer[];
}

export const SegmentPeersDataTable = ({ peers }: SegmentPeersDataTableProps) => {
	const [visiblePeers, setVisiblePeers] = useState<SegmentPeer[]>(peers);

	const [currentSortState, setCurrentSortState] = useState<SortState>({
		column: SortColumn.Url,
		descending: true
	});

	useEffect(() => {
		sortPeers(peers, currentSortState);
	}, [peers]);

	const sortPeers = (peers: SegmentPeer[], sotOpt: SortState): void => {
		let tosort = [...peers];
		let sortedPeers = tosort.sort((a, b) => {
			if (sotOpt.column === SortColumn.Url) {
				return compareStrings(a.url, b.url, sotOpt.descending);
			} else {
				return compareNumbers(a.downloadRate, b.downloadRate, sotOpt.descending);
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

	return (
		<table className="table-fixed text-left">
			<thead>
				<tr className="border-b">
					<th
						className="px-4 py-2 cursor-pointer"
						onClick={() => {
							sortPeers(visiblePeers, {
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
							sortPeers(visiblePeers, {
								column: SortColumn.Rate,
								descending: !currentSortState.descending
							});
						}}
					>
						<div className="flex flex-row">
							Rate
							{getArrowIcon(SortColumn.Rate)}
						</div>
					</th>
				</tr>
			</thead>
			<tbody>
				{visiblePeers.map((peer) => {
					return (
						<tr className="border-b">
							<td className="px-4 py-2">{peer.url}</td>
							<td className="px-4 py-2">{multipleBytes(peer.downloadRate)}</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
