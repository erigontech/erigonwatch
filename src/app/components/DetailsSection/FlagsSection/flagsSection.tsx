import { useEffect, useState } from "react";
import { Flag } from "../../../../entities";
import { FlagsTable } from "./flagsTable";
import { selectFlagsForNode } from "../../../store/appSlice";
import { useSelector } from "react-redux";
import { getNodeFlags } from "../../../../Network/APIGateway";

export const FlagsSection = () => {
	const [flagsToDisplay, setFlagsToDisplay] = useState<Flag[]>([]);
	const flagsArgs = useSelector(selectFlagsForNode);

	useEffect(() => {
		if (!flagsArgs || flagsArgs.length === 0) {
			getNodeFlags();
		} else {
			setFlagsToDisplay(flagsArgs);
		}
	}, [flagsArgs]);

	return (
		<div className="flex flex-col">
			<input
				type="text"
				className="border-2 border-gray-300 rounded-lg p-2 mb-2"
				placeholder="Search"
				onChange={(e) => {
					if (!flagsArgs) return;

					const searchValue = e.target.value.toLowerCase();
					if (searchValue === "") {
						setFlagsToDisplay(flagsArgs);
						return;
					}

					const filtered = flagsArgs.filter(
						(flag) => flag.flag.toLowerCase().includes(searchValue) || flag.usage.toLowerCase().includes(searchValue)
					);

					setFlagsToDisplay(filtered);
				}}
			/>
			<FlagsTable flags={flagsToDisplay} />
		</div>
	);
};
