import { useEffect, useState } from "react";
import { getNodeCmdLineArgs } from "../../../../Network/APIGateway";
import { useSelector } from "react-redux";
import { selectCmdLineArgsForNode } from "../../../store/appSlice";

export const CommandLineArgsSection = () => {
	const cmdLineArgs = useSelector(selectCmdLineArgsForNode);

	useEffect(() => {
		if (!cmdLineArgs) {
			getNodeCmdLineArgs();
		}
	}, [cmdLineArgs]);

	if (cmdLineArgs === undefined) {
		return null;
	}

	return (
		<div className="flex flex-col">
			<span className="mb-2">{cmdLineArgs}</span>
		</div>
	);
};
