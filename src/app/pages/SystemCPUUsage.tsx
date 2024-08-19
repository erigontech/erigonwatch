import { useSelector } from "react-redux";
import { Button, CircularProgress } from "@mui/material";
import { getCpuUsage } from "../../Network/APIGateway";
import { useEffect, useState } from "react";
import { selectCPUInfoForActiveNode, selectCPUUsageForActiveNode } from "../store/systemInfoSlice";

export const SystemCPUUsage = () => {
	const cpuInfo = useSelector(selectCPUInfoForActiveNode);
	const cpuUsage = useSelector(selectCPUUsageForActiveNode);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setLoading(false);
	}, [cpuUsage]);

	const numberTo2Decimal = (num: number) => {
		return Math.round(num * 100) / 100;
	};

	return (
		<div className="mt-4 flex flex-col max-h-[760px] overflow-auto">
			<h3 className="text-xl font-semibold">CPU Info</h3>
			<table
				className="table-auto bg-white text-left"
				data-testid="details_section_processes_table"
			>
				<thead>
					<tr className="border-b">
						<th className="px-4 py-2">CPU</th>
						<th className="px-4 py-2">Vendor ID</th>
						<th className="px-4 py-2">Family</th>
						<th className="px-4 py-2">Model</th>
						<th className="px-4 py-2">Stepping</th>
						<th className="px-4 py-2">Physical ID</th>
						<th className="px-4 py-2">Core ID</th>
						<th className="px-4 py-2">Cores</th>
						<th className="px-4 py-2">Model Name</th>
						<th className="px-4 py-2">Mhz</th>
						<th className="px-4 py-2">Cache Size</th>
						<th className="px-4 py-2">Flags</th>
						<th className="px-4 py-2">Microcode</th>
					</tr>
				</thead>
				<tbody>
					{cpuInfo.map((info) => (
						<tr
							key={info.modelName}
							className="border-b border-gray-200"
						>
							<td className="px-4 py-2">{info.cpu}</td>
							<td className="px-4 py-2">{info.vendorId}</td>
							<td className="px-4 py-2">{info.family}</td>
							<td className="px-4 py-2">{info.model}</td>
							<td className="px-4 py-2">{info.stepping}</td>
							<td className="px-4 py-2">{info.physicalId}</td>
							<td className="px-4 py-2">{info.coreId}</td>
							<td className="px-4 py-2">{info.cores}</td>
							<td className="px-4 py-2">{info.modelName}</td>
							<td className="px-4 py-2">{info.mhz}</td>
							<td className="px-4 py-2">{info.cacheSize}</td>
							<td className="px-4 py-2">{info?.flags?.join(", ")}</td>
							<td className="px-4 py-2">{info.microcode}</td>
						</tr>
					))}
				</tbody>
			</table>
			<h3 className="text-xl font-semibold">CPU Usage</h3>
			<div className="flex w-full items-center justify-center mb-4">
				{loading ? (
					<CircularProgress />
				) : (
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							setLoading(true);
							getCpuUsage();
						}}
					>
						Fetch Data
					</Button>
				)}
			</div>

			<table
				className="table-auto rounded-lg bg-white text-left"
				data-testid="details_section_processes_table"
			>
				<thead>
					<tr className="border-b">
						<th className="px-4 py-2">Core #</th>
						<th className="px-4 py-2">% Usage</th>
					</tr>
				</thead>
				<tbody>
					{cpuUsage.cores?.map((core, idx) => (
						<tr
							key={idx}
							className="border-b border-gray-200"
						>
							<td className="px-4 py-2">{idx + 1}</td>
							<td className="px-4 py-2">{numberTo2Decimal(core)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
