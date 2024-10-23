import { LineChart } from "@mui/x-charts";
import { SegmentPeerDiagData, selectSnapshotDownloadStatusesForNode } from "../../store/syncStagesSlice";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";

export interface TorrentPeersHistoryProps {
	peer: SegmentPeerDiagData;
}

interface LineChartData {
	xAxis: { data: number[] }[];
	series: { data: number[] }[];
}

export const TorrentPeersHistory = ({ peer }: TorrentPeersHistoryProps) => {
	const syncStatus = useSelector(selectSnapshotDownloadStatusesForNode);

	const [data, setData] = useState<LineChartData>({
		xAxis: [{ data: [] }],
		series: [{ data: [] }]
	});

	const bytesToMB = (bytes: number): number => {
		return bytes / 1024 / 1024;
	};

	const getLineChartDataFromPeer = (peer: SegmentPeerDiagData): LineChartData => {
		let dLrates: number[] = [];
		let uPrates: number[] = [];
		let pieces: number[] = [];
		let allDlRates: number[] = [];
		let allPieces: number[] = [];
		let allUpRates: number[] = [];

		let timeTable: number[] = [];

		let timeGrabbed: Map<number, boolean> = new Map();

		syncStatus.diagramData.forEach((d) => {
			timeTable.push(d.time);
			allDlRates.push(bytesToMB(d.dLspeed));
			allUpRates.push(bytesToMB(d.uPspeed));
			allPieces.push(d.pieces);
		});

		timeTable.forEach((time) => {
			peer.diagramData.forEach((d) => {
				if (d.time === time) {
					if (timeGrabbed.get(time)) {
						dLrates[dLrates.length - 1] += bytesToMB(d.dLspeed);
						uPrates[uPrates.length - 1] += bytesToMB(d.uPspeed);
						pieces[pieces.length - 1] += d.pieces;
					} else {
						timeGrabbed.set(time, true);
						uPrates.push(bytesToMB(d.uPspeed));
						dLrates.push(bytesToMB(d.dLspeed));
						pieces.push(d.pieces);
					}
				}
			});

			if (!timeGrabbed.get(time)) {
				timeGrabbed.set(time, true);
				uPrates.push(bytesToMB(0));
				dLrates.push(bytesToMB(0));
				pieces.push(0);
			}
		});

		const series = [
			{
				data: dLrates
			},
			{
				data: pieces
			},
			{
				data: allDlRates
			},
			{
				data: allPieces
			},
			{
				data: uPrates
			},
			{
				data: allUpRates
			}
		];
		return { xAxis: [{ data: timeTable }], series };
	};

	useEffect(() => {
		setData(getLineChartDataFromPeer(peer));
	}, [peer]);

	return (
		<Box
			sx={{
				maxHeight: "80vh",
				overflow: "auto" // Enables vertical scrolling
			}}
		>
			<p>Download Rate MB/s</p>
			<LineChart
				xAxis={data.xAxis}
				series={[
					{
						data: data?.series[0]?.data || []
					},
					{
						data: data?.series[2]?.data || []
					}
				]}
				width={1000}
				height={250}
				margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
			/>
			<p>Upload Rate MB/s</p>
			<LineChart
				xAxis={data.xAxis}
				series={[
					{
						data: data?.series[4]?.data || []
					},
					{
						data: data?.series[5]?.data || []
					}
				]}
				width={1000}
				height={250}
				margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
			/>
			<p>Pieces Count</p>
			<LineChart
				xAxis={data.xAxis}
				series={[
					{
						data: data?.series[1]?.data || []
					},
					{
						data: data?.series[3]?.data || []
					}
				]}
				width={1000}
				height={250}
				margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
			/>
		</Box>
	);
};
