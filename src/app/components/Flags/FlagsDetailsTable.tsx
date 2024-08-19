import { Flag } from "../../../entities";
import { FlagsDetailsTableRow } from "./FlagDetailsTableRow";

interface FlagsDetailsTableProps {
	flags?: Flag[];
}

export const FlagsDetailsTable = ({ flags }: FlagsDetailsTableProps) => {
	return (
		<div className="flex flex-col shadow-lg rounded-md p-2 bg-white min-h-[40px] max-h-[500px] max-w-[1400px] min-w-[30vw] overflow-auto">
			<table
				className="table-auto rounded-lg bg-white text-left"
				data-testid="details_section_flags_table"
			>
				<thead>
					<tr className="border-b">
						<th className="px-4 py-2">Flag</th>
						<th className="px-4 py-2">Value</th>
						<th className="px-4 py-2">Flag Usage</th>
					</tr>
				</thead>
				<tbody>
					{flags?.map((flag) => (
						<FlagsDetailsTableRow
							flag={flag}
							key={flag.flag}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
};
