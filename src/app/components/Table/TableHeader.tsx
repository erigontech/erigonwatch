import { ArrowDropDown, Sort } from "@mui/icons-material";
import React from "react";

interface TableHeaderProps {
	title: string;
	filter?: boolean;
	sort?: boolean;
	onFilterChange?: (value: string) => void;
	onSortChange?: (value: string) => void;
}

export const TableHeader = ({ title, filter = false, sort = true, onFilterChange, onSortChange }: TableHeaderProps) => {
	const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

	return (
		<th className="px-4 py-2">
			<div className="flex flex-row">
				<div className="flex flex-col">
					<span>{title}</span>
					{filter && (
						<input
							className="border rounded-lg p-1"
							onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
						/>
					)}
				</div>
				{sort && (
					<div className="flex flex-col">
						<ArrowDropDown
							className="cursor-pointer"
							onClick={() => {
								setSortDirection(sortDirection === "asc" ? "desc" : "asc");
								onSortChange && onSortChange(sortDirection === "asc" ? "desc" : "asc");
							}}
						/>
					</div>
				)}
			</div>
		</th>
	);
};
