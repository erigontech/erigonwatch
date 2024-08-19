import { Button } from "@mui/material";
import { getProcessesInfo } from "../../Network/APIGateway";
import { useSelector } from "react-redux";
import { ProcessesInfo, selectProcessesInfoForActiveNode } from "../store/systemInfoSlice";
import { ProcessesTable } from "../components/Processes/ProcessesTable";
import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";

export const SystemProcessesPage = () => {
	const processes = useSelector(selectProcessesInfoForActiveNode);
	const [data, setData] = useState<ProcessesInfo[]>(processes);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setData(processes);
		setLoading(false);
	}, [processes]);

	return (
		<div className="mt-4 flex flex-col">
			<div className="flex w-full items-center justify-center mb-4">
				{loading ? (
					<CircularProgress />
				) : (
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							setLoading(true);
							getProcessesInfo();
						}}
					>
						Fetch Data
					</Button>
				)}
			</div>
			<input
				type="text"
				className="border-2 border-gray-300 rounded-lg p-2 mb-2"
				placeholder="Search"
				onChange={(e) => {
					const filteredProcesses = processes?.filter((process) => {
						return process.name.toLowerCase().includes(e.target.value.toLowerCase());
					});

					setData(filteredProcesses);
				}}
			/>
			<ProcessesTable processes={data} />
		</div>
	);
};
