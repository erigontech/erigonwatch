import React, { useEffect } from "react";
import { Flag } from "../../../../entities";
import { FlagsTableRow } from "./flagTableRow";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import SortIcon from "@mui/icons-material/Sort";

interface FlagsTableProps {
	flags?: Flag[];
}

enum SortBy {
	DEFAULT = "default",
	FLAG_NAME = "flag",
	VALUE = "value"
}

export const FlagsTable = ({ flags }: FlagsTableProps) => {
	const [isSortingApplied, setIsSortingApplied] = React.useState<boolean>(false);
	const [visibleFlags, setVisibleFlags] = React.useState<Flag[]>([]);
	const [defaultValueSort, setDefaultValueSort] = React.useState<boolean>(true);

	useEffect(() => {
		const filteredFlags = filterFlagsWithEmptyValues(flags);
		setVisibleFlags(filteredFlags);
	}, [flags]);

	const filterFlagsWithEmptyValues = (flags: Flag[] | undefined): Flag[] => {
		if (flags === undefined) {
			return [];
		}

		let filtered = flags.filter((flag) => flag.value !== undefined && flag.value !== "" && flag.value !== null);
		return filtered.sort((a, b) => a.flag.localeCompare(b.flag));
	};

	const getSortedFlagsBy = (flagsArray: Flag[], sort: SortBy) => {
		if (sort === SortBy.DEFAULT) {
			let filtered: Flag[] = [];
			if (defaultValueSort) {
				filtered = flagsArray.sort((a, b) => (a.default > b.default ? 1 : -1));
			} else {
				filtered = flagsArray.sort((a, b) => (a.default < b.default ? 1 : -1));
			}

			return filtered;
		} else if (sort === SortBy.FLAG_NAME) {
			return flagsArray.sort((a, b) => a.flag.localeCompare(b.flag));
		} else {
			return flagsArray;
		}
	};

	const sortByDefaultValue = () => {
		const sortedFlagsByDefault = getSortedFlagsBy(visibleFlags, SortBy.DEFAULT);

		setVisibleFlags(sortedFlagsByDefault);
		setDefaultValueSort(!defaultValueSort);
		setIsSortingApplied(true);
	};

	const getArrowIcon = () => {
		if (!isSortingApplied) {
			return <SortIcon className="ml-2" />;
		} else {
			if (defaultValueSort) {
				return <ArrowDropDownIcon />;
			} else {
				return <ArrowDropUpIcon />;
			}
		}
	};

	return (
		<div className="w-full overflow-hidden flex flex-col rounded-lg bg-white">
			<table
				className="w-full table-fixed text-left"
				data-testid="details_section_flags_table"
			>
				<thead className="sticky top-0 bg-white border-b">
					<tr>
						<th className="px-4 py-2 w-1/3">Flag</th>
						<th className="px-4 py-2 w-1/3">Value</th>
						<th
							className="px-4 py-2 w-1/3 cursor-pointer"
							onClick={sortByDefaultValue}
						>
							<div className="flex flex-row">
								Default
								{getArrowIcon()}
							</div>
						</th>
					</tr>
				</thead>
			</table>
			<div className="flex-1 overflow-y-auto">
				<table className="w-full table-fixed text-left">
					<tbody>
						{visibleFlags.length > 0 ? (
							visibleFlags.map((flag) => (
								<FlagsTableRow
									flag={flag}
									key={flag.flag}
								/>
							))
						) : (
							<tr>
								<td
									colSpan={3}
									className="px-4 py-2 text-center text-gray-500"
								>
									No flags match your search criteria
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};
