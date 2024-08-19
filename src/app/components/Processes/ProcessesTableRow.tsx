import { ProcessesInfo } from "../../store/systemInfoSlice";

interface ProcessesTableRowProps {
	process: ProcessesInfo;
}

const numberTo2Decimal = (num: number) => {
	return Math.round(num * 100) / 100;
};

export const ProcessesTableRow = ({ process }: ProcessesTableRowProps) => {
	return (
		<tr
			key={process.pid}
			className="border-b border-gray-200"
		>
			<td className="px-4 py-2">{process.pid}</td>
			<td className="px-4 py-2">{process.name}</td>
			<td className="px-4 py-2">{numberTo2Decimal(process.cpuUsage)}</td>
			<td className="px-4 py-2">{numberTo2Decimal(process.memory)}</td>
		</tr>
	);
};
