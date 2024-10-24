import { LogFile } from "../store/appSlice";
import CheckIcon from "@mui/icons-material/Check";
import DownloadIcon from "@mui/icons-material/Download";
import { multipleBytes } from "../../helpers/converters";

interface LogListProps {
	logs?: LogFile[];
	onLogSelected: (nodeId: string) => void;
	onDownload: (log: LogFile) => void;
}

export const LogList = ({ logs = [], onLogSelected, onDownload, ...props }: LogListProps) => {
	const onLogClicked = (nodeId: string) => {
		onLogSelected(nodeId);
	};

	const renderSessionsTable = () => {
		return (
			<table className="table-auto w-fit text-left border-0 rounded-lg shadow-lg relative bg-white outline-none focus:outline-none">
				<thead>
					<tr className="border-b">
						<th />
						<th className="px-4 py-2">Name</th>
						<th className="px-4 py-2">Size</th>
						<th />
					</tr>
				</thead>
				<tbody>
					{logs.map((log, index) => {
						return (
							<tr
								className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
								key={index}
								onClick={() => onLogClicked(log.name)}
							>
								<td className="pl-2">{log.selected && <CheckIcon />}</td>
								<td className="px-4 py-2">{log.name}</td>
								<td className="px-4 py-2">{multipleBytes(log.size)}</td>
								<td>
									<DownloadIcon
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();

											onDownload(log);
										}}
										className="cursor-pointer pr-2 hover:scale-125"
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	};

	return <>{renderSessionsTable()}</>;
};
