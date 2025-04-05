import { Box, Typography, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { useCallback, useMemo } from "react";

export interface TimeChartData {
	xAxis: { data: number[] };
	series: { data: number[] };
}

const getMultiplier = (value: number): string => {
	if (value >= 1024 * 1024 * 1024 * 1024) {
		return "TB";
	} else if (value >= 1024 * 1024 * 1024) {
		return "GB";
	} else if (value >= 1024 * 1024) {
		return "MB";
	} else if (value >= 1024) {
		return "KB";
	} else {
		return "B";
	}
};

const getYAxisLabel = (maxValue: number, speed: boolean) => {
	const multiplier = getMultiplier(maxValue);
	return speed ? multiplier + "/s" : multiplier;
};

const convertToSpeed = (maxValue: number, value: number | null) => {
	if (value === null) return null;

	const multiplier = getMultiplier(maxValue);
	let divisor = 1;

	if (multiplier === "KB") divisor = 1024;
	else if (multiplier === "MB") divisor = 1024 * 1024;
	else if (multiplier === "GB") divisor = 1024 * 1024 * 1024;
	else if (multiplier === "TB") divisor = 1024 * 1024 * 1024 * 1024;

	return Number((value / divisor).toFixed(2));
};

// Format a converted value to string, handling null case
const formatValue = (value: number | null): string => {
	return value === null ? "-" : value.toString();
};

export const TimeChart = ({ valueData, timeData, title }: { valueData: number[]; timeData: number[]; title: string }) => {
	// Sample data to reduce number of points
	const createSeries = useCallback((data: number[], timeData: number[], maxPoints: number = 200): TimeChartData => {
		if (data.length <= maxPoints)
			return {
				xAxis: { data: timeData },
				series: { data }
			};

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

		return {
			xAxis: { data: sampledTime },
			series: { data: sampledData }
		};
	}, []);

	const data = createSeries(valueData, timeData);
	const maxValue = useMemo(() => Math.max(...data.series.data), [data.series.data]);
	const isRateChart = useMemo(() => title.includes("Rate"), [title]);
	const yAxisLabel = useMemo(() => getYAxisLabel(maxValue, isRateChart), [maxValue, isRateChart]);
	const chartLabel = useMemo(() => title + " " + yAxisLabel, [title, yAxisLabel]);

	return (
		<Box
			sx={{
				maxHeight: "80vh",
				overflow: "auto"
			}}
		>
			<Typography
				variant="h6"
				gutterBottom
			>
				{title}
			</Typography>
			<LineChart
				sx={{ width: "100%" }}
				height={250}
				margin={{ top: 50, right: 50, bottom: 50, left: 100 }}
				xAxis={[
					{
						label: "Time",
						labelStyle: { fontSize: 14 },
						data: data.xAxis.data,
						valueFormatter: (value: number) => {
							const formatTime = (value: number): string => {
								if (value === 0) return "0s";

								value = value * 20; //one point is 20 seconds

								const hours = Math.floor(value / 3600);
								const minutes = Math.floor((value % 3600) / 60);
								const seconds = Math.floor(value % 60);

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
					}
				]}
				yAxis={[
					{
						valueFormatter: (value: number) => {
							const converted = convertToSpeed(maxValue, value);
							return formatValue(converted) + " " + yAxisLabel;
						},
						labelStyle: { fontSize: 14 }
					}
				]}
				series={[
					{
						...data.series,
						label: chartLabel,
						valueFormatter: (value: number | null) => {
							const converted = convertToSpeed(maxValue, value);
							return formatValue(converted);
						}
					}
				]}
			/>
		</Box>
	);
};
