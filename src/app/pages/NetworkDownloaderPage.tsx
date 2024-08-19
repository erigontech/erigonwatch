import { useSelector } from "react-redux";
import { bytesToSpeedPerSecond, calculatePercentDownloaded, clculateDownloadTimeLeft, multipleBytes, secondsToHms } from "../../helpers/converters";
import { SnapshotDowndloadDetailsPopup } from "../components/SyncStages/SnapshotDowndloadDetailsPopup";
import { useState } from "react";
import { selectSnapshotDownloadStatusesForNode } from "../store/syncStagesSlice";
import { selectFlagsForNode } from "../store/appSlice";
import { FlagsDetailsTable } from "../components/Flags/FlagsDetailsTable";
import { downloaderFlags } from "../components/Flags/flagConstants";
import { selectNetworkSpeedIssues } from "../store/issuesSlice";
import { useNavigate } from "react-router-dom";

export const NetworkDownloaderPage = () => {
	const syncStatus = useSelector(selectSnapshotDownloadStatusesForNode);
	const [showDetails, setShowDetails] = useState(false);
	const allFlags = useSelector(selectFlagsForNode);
	const issues = useSelector(selectNetworkSpeedIssues);
	const navigate = useNavigate();
	const handleIssuesClick = () => navigate("/issues");

	const flags = allFlags.filter((flag) => {
		return downloaderFlags.includes(flag.flag);
	});

	const snapshotStatus = () => {
		if (!syncStatus.downloadFinished && syncStatus.indexed < 100 && syncStatus.torrentMetadataReady < syncStatus.files) {
			if (syncStatus.downloaded > 0) {
				return "downloading and waiting for metadata";
			} else {
				return "waiting for metadata";
			}
		} else if (!syncStatus.downloadFinished && syncStatus.indexed < 100) {
			return "Downloading";
		} else if (syncStatus.indexed < 100) {
			return "Indexing";
		} else {
			return "Finished";
		}
	};

	const totalTime = () => {
		let ttime = 0;
		syncStatus.totalTime.forEach((time) => {
			ttime += time;
		});
		return secondsToHms(ttime);
	};

	return (
		<div>
			{issues.length > 0 && (
				<p
					className="font-bold mt-5 mb-5 text-yellow-400 cursor-pointer"
					onClick={handleIssuesClick}
				>
					{"Found " + issues.length + " download speed issues"}
				</p>
			)}
			<table className="table-auto w-fit border-0 rounded-lg shadow-lg relative bg-white outline-none focus:outline-none mb-4">
				<thead>
					<tr className="border-b">
						<th className="px-4 py-2">Name</th>
						<th className="px-4 py-2">Status</th>
						<th className="px-4 py-2">Progress</th>
						<th className="px-4 py-2">Downaloaded</th>
						<th className="px-4 py-2">Total</th>
						<th className="px-4 py-2">Time Left</th>
						<th className="px-4 py-2">Total Time</th>
						<th className="px-4 py-2">Download Rate</th>
						<th className="px-4 py-2">Upload Rate</th>
						<th className="px-4 py-2">Peers</th>
						<th className="px-4 py-2">Files</th>
						<th className="px-4 py-2">Connections</th>
						<th className="px-4 py-2">Alloc</th>
						<th className="px-4 py-2">Sys</th>
					</tr>
				</thead>
				<tbody>
					{
						//syncStatus?.downloaded && (
						<tr
							onClick={() => {
								setShowDetails(true);
							}}
						>
							<td className="px-4 py-2">{"Snapshots"}</td>
							<td className="px-4 py-2 text-center">{snapshotStatus()}</td>
							<td className="px-4 py-2">{calculatePercentDownloaded(syncStatus.downloaded, syncStatus.total)}</td>
							<td className="px-4 py-2">{multipleBytes(syncStatus.downloaded)}</td>
							<td className="px-4 py-2">{multipleBytes(syncStatus.total)}</td>
							<td className="px-4 py-2">{clculateDownloadTimeLeft(syncStatus.downloaded, syncStatus.total, syncStatus.downloadRate)}</td>
							<td className="px-4 py-2">{totalTime()}</td>
							<td className="px-4 py-2">{bytesToSpeedPerSecond(syncStatus.downloadRate)}</td>
							<td className="px-4 py-2">{bytesToSpeedPerSecond(syncStatus.uploadRate)}</td>
							<td className="px-4 py-2">{syncStatus.peers}</td>
							<td className="px-4 py-2">{syncStatus.files}</td>
							<td className="px-4 py-2">{syncStatus.connections}</td>
							<td className="px-4 py-2">{multipleBytes(syncStatus.alloc)}</td>
							<td className="px-4 py-2">{multipleBytes(syncStatus.sys)}</td>
						</tr>
						//)
					}
				</tbody>
			</table>
			<div className="flex flex-col">
				<p className="font-bold mt-5">Flags related to downloader</p>
				<FlagsDetailsTable flags={flags} />
			</div>
			{showDetails && (
				<SnapshotDowndloadDetailsPopup
					onClose={() => {
						setShowDetails(false);
					}}
				/>
			)}
		</div>
	);
};
