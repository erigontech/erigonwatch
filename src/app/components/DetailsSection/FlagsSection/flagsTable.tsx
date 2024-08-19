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
		return filtered.sort((a, b) => a.flag.localeCompare(a.flag));
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
		<table
			className="table-auto rounded-lg bg-white text-left"
			data-testid="details_section_flags_table"
		>
			<thead>
				<tr className="border-b">
					<th className="px-4 py-2">Flag</th>
					<th className="px-4 py-2">Value</th>
					<th
						className="px-4 py-2 cursor-pointer"
						onClick={sortByDefaultValue}
					>
						<div className="flex flex-row">
							Default
							{getArrowIcon()}
						</div>
					</th>
				</tr>
			</thead>
			<tbody>
				{visibleFlags.map((flag) => (
					<FlagsTableRow
						flag={flag}
						key={flag.flag}
					/>
				))}
			</tbody>
		</table>
	);
};
