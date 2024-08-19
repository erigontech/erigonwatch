import { useEffect, useState } from "react";
import { ProcessesInfo } from "../../store/systemInfoSlice";
import { ProcessesTableRow } from "./ProcessesTableRow";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SortIcon from "@mui/icons-material/Sort";

interface ProcessesTableProps {
	processes?: ProcessesInfo[];
}

enum SortColumn {
	Pid = "Pid",
	Name = "Name",
	Cpu = "Cpu",
	Memory = "Memory"
}

interface SortState {
	column: SortColumn;
	descending: boolean;
}

export const ProcessesTable = ({ processes }: ProcessesTableProps) => {
	const [visibleProcesses, setVisibleProcesses] = useState<ProcessesInfo[]>([]);
	const [currentSortState, setCurrentSortState] = useState<SortState>({
		column: SortColumn.Name,
		descending: true
	});

	useEffect(() => {
		sortSegments(processes || [], currentSortState);
	}, [processes]);

	const sortSegments = (seg: ProcessesInfo[], sotOpt: SortState): void => {
		let tosort = [...seg];
		let sortedProcesses = tosort.sort((a, b) => {
			if (sotOpt.column === SortColumn.Pid) {
				return compareNumbers(a.pid, b.pid, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Name) {
				return compareStrings(a.name, b.name, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Cpu) {
				return compareNumbers(a.cpuUsage, b.cpuUsage, sotOpt.descending);
			} else if (sotOpt.column === SortColumn.Memory) {
				return compareNumbers(a.memory, b.memory, sotOpt.descending);
			} else {
				return 0;
			}
		});

		setCurrentSortState(sotOpt);
		setVisibleProcesses(sortedProcesses);
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
		<div className="flex flex-col shadow-lg rounded-md p-2 bg-white min-h-[40px] max-h-[660px] overflow-auto">
			<table
				className="table-auto rounded-lg bg-white text-left"
				data-testid="details_section_processes_table"
			>
				<thead>
					<tr className="border-b">
						<th
							className="px-4 py-2"
							onClick={() => {
								sortSegments(visibleProcesses, {
									column: SortColumn.Pid,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								PID
								{getArrowIcon(SortColumn.Pid)}
							</div>
						</th>
						<th
							className="px-4 py-2"
							onClick={() => {
								sortSegments(visibleProcesses, {
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
							className="px-4 py-2"
							onClick={() => {
								sortSegments(visibleProcesses, {
									column: SortColumn.Cpu,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								% CPU Usage
								{getArrowIcon(SortColumn.Cpu)}
							</div>
						</th>
						<th
							className="px-4 py-2"
							onClick={() => {
								sortSegments(visibleProcesses, {
									column: SortColumn.Memory,
									descending: !currentSortState.descending
								});
							}}
						>
							<div className="flex flex-row">
								% Memory Usage
								{getArrowIcon(SortColumn.Memory)}
							</div>
						</th>
					</tr>
				</thead>
				<tbody>
					{visibleProcesses?.map((process) => (
						<ProcessesTableRow
							process={process}
							key={process.pid}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
};
