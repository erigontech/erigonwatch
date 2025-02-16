import { NodeInfo } from "../../../../entities";
import { NodeInfoTable } from "./nodeInfoTable";

export interface NodeInfoSectionProps {
	nodeDetails?: NodeInfo;
	onShowNodeValueDetails: (key: string, value: string) => void;
}

export const NodeInfoSection = ({ nodeDetails, onShowNodeValueDetails }: NodeInfoSectionProps) => {
	if (nodeDetails === undefined) {
		return null;
	}

	return (
		<div className="flex flex-col">
			<NodeInfoTable
				nodeInfo={nodeDetails}
				onRowClicked={(key: string, value: string) => {
					onShowNodeValueDetails(key, value);
				}}
			/>
		</div>
	);
};
