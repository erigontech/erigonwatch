import { useSelector } from "react-redux";
import { selectCPUInfoForActiveNode, selectDiskInfoForActiveNode, selectRAMInfoForActiveNode } from "../store/systemInfoSlice";
import { multipleBytes } from "../../helpers/converters";

export const SystemInfoPage = () => {
	const cpuInfo = useSelector(selectCPUInfoForActiveNode);
	const diskInfo = useSelector(selectDiskInfoForActiveNode);
	const ramInfo = useSelector(selectRAMInfoForActiveNode);

	const numberTo2Decimal = (num: number) => {
		return Math.round(num * 100) / 100;
	};

	const parseDetailsString = (details: string) => {
		const result: any[] = [];
		const lines = details?.split("\n");
		if (!lines) {
			return result;
		}
		for (const line of lines) {
			const col = line?.split(":");
			if (!col) {
				continue;
			}
			const row = col.map((c) => {
				return <td>{c}</td>;
			});
			result.push(<tr>{row}</tr>);
		}

		return result;
	};

	return (
		<div className="flex flex-col  p-2 min-h-[40px] max-h-[780px] overflow-auto">
			<h3 className="text-xl font-semibold">CPU Info</h3>
			<table
				className="table-auto rounded-lg bg-white text-left"
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
			<h3 className="text-xl font-semibold mt-4">Disk Info</h3>

			<table className="table-auto text-left bg-white">
				<tbody>
					<tr>
						<td>Device</td>
						<td>{diskInfo.device}</td>
					</tr>
					<tr>
						<td>Mount Point</td>
						<td>{diskInfo.mountPoint}</td>
					</tr>
					<tr>
						<td>File System Type</td>
						<td>{diskInfo.fsType}</td>
					</tr>
					<tr>
						<td>Total</td>
						<td>{multipleBytes(diskInfo.total)}</td>
					</tr>
					<tr>
						<td>Free</td>
						<td>{multipleBytes(diskInfo.free)}</td>
					</tr>
					{parseDetailsString(diskInfo.details)}
				</tbody>
			</table>
			<h3 className="text-xl font-semibold">Ram Info</h3>
			<table className="table-auto text-left bg-white">
				<tbody>
					<tr>
						<td>Total</td>
						<td>{multipleBytes(ramInfo.total)}</td>
					</tr>
					<tr>
						<td>Available</td>
						<td>{multipleBytes(ramInfo.available)}</td>
					</tr>
					<tr>
						<td>Used</td>
						<td>{multipleBytes(ramInfo.used)}</td>
					</tr>
					<tr>
						<td>Used Percent</td>
						<td>{numberTo2Decimal(ramInfo.usedPercent)}%</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};
