import { useEffect, useState } from "react";
import { Flag } from "../../../../entities";
import { FlagsTable } from "./flagsTable";
import { selectFlagsForNode } from "../../../store/appSlice";
import { useSelector } from "react-redux";
import { getNodeFlags } from "../../../../Network/APIGateway";

export interface FlagsSectionProps {
	flags?: Flag[];
}

export const FlagsSection = ({ flags }: FlagsSectionProps) => {
	/*const [data, setData] = useState<Flag[]>([]);

	useEffect(() => {
		if (flags !== undefined) {
			setData(flags);
		}
	}, [flags]);*/

	const [flagsToDisplay, setFlagsToDisplay] = useState<Flag[]>([]);
	const flagsArgs = useSelector(selectFlagsForNode);

	useEffect(() => {
		if (!flagsArgs) {
			getNodeFlags();
		} else {
			setFlagsToDisplay(flagsArgs);
		}
	}, [flagsArgs]);

	useEffect(() => {
		console.log(flagsToDisplay.length);
	}, [flagsToDisplay]);

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
