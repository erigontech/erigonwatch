import { Flag } from "../../../entities";

interface FlagsDetailsTableRowProps {
	flag: Flag;
}

export const FlagsDetailsTableRow = ({ flag }: FlagsDetailsTableRowProps) => {
	function isArray(value: any): boolean {
		return value && typeof value === "object" && value.constructor === Array;
	}

	const renderValue = (value: boolean | string | number | string[] | number[]) => {
		if (isArray(value)) {
			return renderArray(value as string[] | number[]);
		} else {
			return <td className="px-4 py-2">{String(value)}</td>;
		}
	};

	const renderArray = (value: string[] | number[]) => {
		return (
			<>
				{value.map((val) => (
					<tr
						key={val}
						className="border-b border-gray-200 hover:bg-gray-100"
					>
						<td className="px-4 py-2">{val + ""}</td>
					</tr>
				))}
			</>
		);
	};

	return (
		<tr
			key={flag.flag}
			className="border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
			onMouseOver={(event) => {
				const target = event.target as HTMLElement;
				const flagUsage = flag.usage;
				if (flagUsage) {
					target.setAttribute("title", flagUsage);
				}
			}}
		>
			<td className="px-4 py-2">{flag.flag}</td>
			{renderValue(flag.value)}
			<td className="px-4 py-2">{String(flag.usage)}</td>
		</tr>
	);
};
