import { Flag } from "../../../../entities";

interface FlagsTableRowProps {
	flag: Flag;
}

export const FlagsTableRow = ({ flag }: FlagsTableRowProps) => {
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
		let res = "";
		value.forEach((val, idx) => {
			if (idx < value.length - 1) {
				res += val + ", ";
			}
		});

		return <td className="px-4 py-2">{res}</td>;
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
			<td className="px-4 py-2">{String(flag.default)}</td>
		</tr>
	);
};
