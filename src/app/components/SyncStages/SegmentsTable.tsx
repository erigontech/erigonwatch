import { useState } from "react";
import { calculatePercentDownloaded, multipleBps, multipleBytes } from "../../../helpers/converters";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SortIcon from "@mui/icons-material/Sort";
import { SnapshotSegmentDownloadStatus } from "../../store/syncStagesSlice";
import { FormControlLabel, Switch } from "@mui/material";

enum SortColumn {
	Name = "Name",
	Progress = "Progress",
	Size = "Size",
	PeersCount = "PeersCount",
	PeersRate = "PeersRate",
	WebseedsCount = "WebseedsCount",
	WebseedsRate = "WebseedsRate",
	Active = "Active"
}

interface SortState {
	column: SortColumn;
	descending: boolean;
}

interface UISegment {
	status: SnapshotSegmentDownloadStatus;
	visible: boolean;
	active: boolean;
}

export interface SegmentsTableProps {
	segments: SnapshotSegmentDownloadStatus[];
	segmentSelected: boolean;
	onSegmentClicked: (segment: SnapshotSegmentDownloadStatus) => void;
}

export const SegmentsTable = ({ segments, segmentSelected, onSegmentClicked }: SegmentsTableProps) => {
	const initialVisibleSegments: UISegment[] = segments.map((segment) => ({
		status: segment,
		visible: true,
		active: segment.downloadedBytes < segment.totalBytes && segment.downloadedBytes > 0
	}));

	const [visibleSegments, setVisibleSegments] = useState<UISegment[]>(initialVisibleSegments);
	const [hideCompletedChecked, setHideCompletedChecked] = useState(false);
	const [hideZeroProgressChecked, setHideZeroProgressChecked] = useState(false);

	const [currentSortState, setCurrentSortState] = useState<SortState>({
		column: SortColumn.Name,
		descending: true
	});

	const peersCount = (segment: SnapshotSegmentDownloadStatus): number => {
		return segment.peers.length || 0;
	};

	const peersRate = (segment: SnapshotSegmentDownloadStatus): number => {
		let downloadRate = 0;
		segment.peers.forEach((peer) => {
			downloadRate += peer.downloadRate;
		});

		return downloadRate;
	};

	const webseedsCount = (segment: SnapshotSegmentDownloadStatus): number => {
		return segment.webseeds.length || 0;
	};

	const webseedsRate = (segment: SnapshotSegmentDownloadStatus): number => {
		let downloadRate = 0;
		segment.webseeds.forEach((webseed) => {
			downloadRate += webseed.downloadRate;
		});

		return downloadRate;
	};

	const getDownloadedPercentNumber = (downloaded: number, total: number): number => {
		return (downloaded / total) * 100;
	};

	const sortSegments = (seg: UISegment[], sotOpt: SortState): void => {
		let tosort = [...seg];
		let sortedSegments = tosort.sort((a, b) => {
			if (sotOpt.column === SortColumn.Name) {
				return compareStrings(a.status.name, b.status.name, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Progress) {
				return compareNumbers(
					getDownloadedPercentNumber(a.status.downloadedBytes, a.status.totalBytes),
					getDownloadedPercentNumber(b.status.downloadedBytes, b.status.totalBytes),
					sotOpt.descending
				);
			} else if (sotOpt.column === SortColumn.Size) {
				return compareNumbers(a.status.totalBytes, b.status.totalBytes, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.PeersCount) {
				return compareNumbers(peersCount(a.status), peersCount(b.status), sotOpt.descending);
			} else if (sotOpt.column === SortColumn.PeersRate) {
				return compareNumbers(peersRate(a.status), peersRate(b.status), sotOpt.descending);
			} else if (sotOpt.column === SortColumn.WebseedsCount) {
				return compareNumbers(webseedsCount(a.status), webseedsCount(b.status), sotOpt.descending);
			} else if (sotOpt.column === SortColumn.WebseedsRate) {
				return compareNumbers(webseedsRate(a.status), webseedsRate(b.status), sotOpt.descending);
			} else {
				return compareNumbers(a.active ? 1 : 0, b.active ? 1 : 0, sotOpt.descending);
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

	const handleHideCompletedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setHideCompletedChecked(event.target.checked);
		let filtered = visibleSegments;

		filtered.forEach((seg) => {
			if (event.target.checked) {
				if (getDownloadedPercentNumber(seg.status.downloadedBytes, seg.status.totalBytes) === 100) {
					seg.visible = false;
				}
			} else {
				if (getDownloadedPercentNumber(seg.status.downloadedBytes, seg.status.totalBytes) === 100) {
					seg.visible = true;
				}
			}
		});

		setVisibleSegments(filtered);
	};

	const handleHideZeroProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setHideZeroProgressChecked(event.target.checked);

		let filtered = visibleSegments;

		filtered.forEach((seg) => {
			if (event.target.checked) {
				if (getDownloadedPercentNumber(seg.status.downloadedBytes, seg.status.totalBytes) === 0) {
					seg.visible = false;
				}
			} else {
				if (getDownloadedPercentNumber(seg.status.downloadedBytes, seg.status.totalBytes) === 0) {
					seg.visible = true;
				}
			}
		});

		setVisibleSegments(filtered);
	};

	return (
		<div
			className="w-full h-[95%]"
			style={{ overflowY: !segmentSelected ? "scroll" : "hidden" }}
		>
			<div className="flex flex-row justify-around">
				<FormControlLabel
					control={
						<Switch
							checked={hideCompletedChecked}
							onChange={handleHideCompletedChange}
						/>
					}
					label="Hide downloaded files"
				/>
				<FormControlLabel
					control={
						<Switch
							checked={hideZeroProgressChecked}
							onChange={handleHideZeroProgressChange}
						/>
					}
					label="Hide files with no progress"
				/>
			</div>
			<table className="table-fixed text-left">
				<thead>
					<tr className="border-b">
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.Name,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Name
								{getArrowIcon(SortColumn.Name)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.Progress,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Progress
								{getArrowIcon(SortColumn.Progress)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.Size,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Size
								{getArrowIcon(SortColumn.Size)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.PeersCount,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Peers Count
								{getArrowIcon(SortColumn.PeersCount)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.PeersRate,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Peers Rate
								{getArrowIcon(SortColumn.PeersRate)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.WebseedsCount,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Webseeds Count
								{getArrowIcon(SortColumn.WebseedsCount)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.WebseedsRate,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Webseeds Rate
								{getArrowIcon(SortColumn.WebseedsRate)}
							</div>
						</th>
						<th
							className="px-4 py-2 cursor-pointer"
							onClick={() => {
								sortSegments(visibleSegments, {
									column: SortColumn.Active,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								Active
								{getArrowIcon(SortColumn.Active)}
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{visibleSegments.map((segment) => {
						return (
							<tr
								key={segment.status.name}
								className="border-b hover:bg-gray-100 cursor-pointer"
								onClick={() => {
									onSegmentClicked(segment.status);
								}}
							>
								<td className="px-4 py-2">{segment.status.name}</td>
								<td className="px-4 py-2">{calculatePercentDownloaded(segment.status.downloadedBytes, segment.status.totalBytes)}</td>
								<td className="px-4 py-2">{multipleBytes(segment.status.totalBytes)}</td>
								<td className="px-4 py-2">{peersCount(segment.status)}</td>
								<td className="px-4 py-2">{multipleBps(peersRate(segment.status))}</td>
								<td className="px-4 py-2">{webseedsCount(segment.status)}</td>
								<td className="px-4 py-2">{multipleBps(webseedsRate(segment.status))}</td>
								<td className="px-4 py-2">{segment.active.toString()}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
