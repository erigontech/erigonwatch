import { LineChart } from "@mui/x-charts";
import { SegmentPeerDiagData, selectSnapshotDownloadStatusesForNode } from "../../store/syncStagesSlice";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";

export interface TorrentPeersHistoryProps {
	peer: SegmentPeerDiagData;
}

export interface LineChartData {
	xAxis: { data: number[] }[];
	series: { data: number[] }[];
}

export const TorrentPeersHistory = ({ peer }: TorrentPeersHistoryProps) => {
	const syncStatus = useSelector(selectSnapshotDownloadStatusesForNode);

	const [data, setData] = useState<LineChartData>({
		xAxis: [{ data: [] }],
		series: [{ data: [] }]
	});

	const bytesToMB = useCallback((bytes: number): number => {
		return bytes / 1024 / 1024;
	}, []);

	// Sample data to reduce number of points
	const sampleData = useCallback((data: number[], timeData: number[], maxPoints: number = 100) => {
		if (data.length <= maxPoints) return { data, timeData };

		const step = Math.ceil(data.length / maxPoints);
		const sampledData: number[] = [];
		const sampledTime: number[] = [];

		for (let i = 0; i < data.length; i += step) {
			// Calculate average for this window
			let sum = 0;
			let count = 0;
			for (let j = i; j < Math.min(i + step, data.length); j++) {
				sum += data[j];
				count++;
			}
			sampledData.push(sum / count);
			sampledTime.push(timeData[i]);
		}

		return { data: sampledData, timeData: sampledTime };
	}, []);

	const getLineChartDataFromPeer = useCallback(
		(peer: SegmentPeerDiagData): LineChartData => {
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
				allDlRates.push(bytesToMB(d.downloadRate));
				allUpRates.push(bytesToMB(d.uploadRate));
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

			// Sample the data to reduce number of points
			const sampledDL = sampleData(dLrates, timeTable);
			const sampledUP = sampleData(uPrates, timeTable);
			const sampledPieces = sampleData(pieces, timeTable);
			const sampledAllDL = sampleData(allDlRates, timeTable);
			const sampledAllUP = sampleData(allUpRates, timeTable);
			const sampledAllPieces = sampleData(allPieces, timeTable);

			const series = [
				{
					data: sampledDL.data
				},
				{
					data: sampledPieces.data
				},
				{
					data: sampledAllDL.data
				},
				{
					data: sampledAllPieces.data
				},
				{
					data: sampledUP.data
				},
				{
					data: sampledAllUP.data
				}
			];
			return { xAxis: [{ data: sampledDL.timeData }], series };
		},
		[syncStatus, bytesToMB, sampleData]
	);

	useEffect(() => {
		setData(getLineChartDataFromPeer(peer));
	}, [peer, getLineChartDataFromPeer]);

	// Memoize chart configurations
	const chartConfig = useMemo(
		() => ({
			slotProps: {
				legend: {
					direction: "row" as const,
					position: { vertical: "top" as const, horizontal: "right" as const },
					padding: 0
				}
			}
		}),
		[]
	);

	const axisConfig = useMemo(
		() => ({
			xAxis: [
				{
					label: "Time (seconds)",
					labelStyle: { fontSize: 14 }
				}
			],
			downloadYAxis: [
				{
					label: "Download Rate (MB/s)",
					labelStyle: { fontSize: 14 }
				}
			],
			uploadYAxis: [
				{
					label: "Upload Rate (MB/s)",
					labelStyle: { fontSize: 14 }
				}
			],
			piecesYAxis: [
				{
					label: "Number of Pieces",
					labelStyle: { fontSize: 14 }
				}
			]
		}),
		[]
	);

	return (
		<Box
			sx={{
				width: "100%",
				maxHeight: "80vh",
				overflow: "auto",
				padding: 2
			}}
		>
			<Typography
				variant="h6"
				gutterBottom
			>
				Download Rate
			</Typography>
			<LineChart
				sx={{ width: "100%" }}
				height={250}
				margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
				xAxis={axisConfig.xAxis.map((axis) => ({
					...axis,
					data: data.xAxis[0].data,
					valueFormatter: (value) => {
						const formatTime = (value: number): string => {
							if (value === 0) return "Time: 0s";

							const hours = Math.floor(value / 3600);
							const minutes = Math.floor((value % 3600) / 60);
							const seconds = value % 60;

							if (hours > 0) {
								return `${hours}h ${minutes}m ${seconds}s`;
							} else if (minutes > 0) {
								return `${minutes}m ${seconds}s`;
							} else {
								return `${seconds}s`;
							}
						};

						return formatTime(value);
					}
				}))}
				yAxis={axisConfig.downloadYAxis}
				series={[
					{
						data: data?.series[0]?.data || [],
						label: "Peer Download Rate",
						color: "#1976d2",
						valueFormatter: (value) => (value ? `${value.toFixed(2)} MB/s` : "0 MB/s")
					},
					{
						data: data?.series[2]?.data || [],
						label: "Total Download Rate",
						color: "#2e7d32",
						valueFormatter: (value) => (value ? `${value.toFixed(2)} MB/s` : "0 MB/s")
					}
				]}
				{...chartConfig}
			/>
			<Typography
				variant="h6"
				gutterBottom
				sx={{ mt: 4 }}
			>
				Upload Rate
			</Typography>
			<LineChart
				sx={{ width: "100%" }}
				height={250}
				margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
				xAxis={axisConfig.xAxis.map((axis) => ({
					...axis,
					data: data.xAxis[0].data,
					valueFormatter: (value) => {
						const formatTime = (value: number): string => {
							if (value === 0) return "Time: 0s";

							const hours = Math.floor(value / 3600);
							const minutes = Math.floor((value % 3600) / 60);
							const seconds = value % 60;

							if (hours > 0) {
								return `${hours}h ${minutes}m ${seconds}s`;
							} else if (minutes > 0) {
								return `${minutes}m ${seconds}s`;
							} else {
								return `${seconds}s`;
							}
						};

						return formatTime(value);
					}
				}))}
				yAxis={axisConfig.uploadYAxis}
				series={[
					{
						data: data?.series[4]?.data || [],
						label: "Peer Upload Rate",
						color: "#1976d2",
						valueFormatter: (value) => (value ? `${value.toFixed(2)} MB/s` : "0 MB/s")
					},
					{
						data: data?.series[5]?.data || [],
						label: "Total Upload Rate",
						color: "#2e7d32",
						valueFormatter: (value) => (value ? `${value.toFixed(2)} MB/s` : "0 MB/s")
					}
				]}
				{...chartConfig}
			/>
			<Typography
				variant="h6"
				gutterBottom
				sx={{ mt: 4 }}
			>
				Pieces Count
			</Typography>
			<LineChart
				sx={{ width: "100%" }}
				height={250}
				margin={{ top: 50, right: 50, bottom: 50, left: 70 }}
				xAxis={axisConfig.xAxis.map((axis) => ({
					...axis,
					data: data.xAxis[0].data,
					valueFormatter: (value) => {
						const formatTime = (value: number): string => {
							if (value === 0) return "Time: 0s";

							const hours = Math.floor(value / 3600);
							const minutes = Math.floor((value % 3600) / 60);
							const seconds = value % 60;

							if (hours > 0) {
								return `${hours}h ${minutes}m ${seconds}s`;
							} else if (minutes > 0) {
								return `${minutes}m ${seconds}s`;
							} else {
								return `${seconds}s`;
							}
						};

						return formatTime(value);
					}
				}))}
				yAxis={axisConfig.piecesYAxis}
				series={[
					{
						data: data?.series[1]?.data || [],
						label: "Peer Pieces",
						color: "#1976d2",
						valueFormatter: (value) => (value ? `${value.toFixed(0)} pieces` : "0 pieces")
					},
					{
						data: data?.series[3]?.data || [],
						label: "Total Pieces",
						color: "#2e7d32",
						valueFormatter: (value) => (value ? `${value.toFixed(0)} pieces` : "0 pieces")
					}
				]}
				{...chartConfig}
			/>
		</Box>
	);
};
