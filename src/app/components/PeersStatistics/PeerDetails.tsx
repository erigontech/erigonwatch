import { multipleBps, multipleBytes } from "../../../helpers/converters";
import { makeSelectItemById } from "../../store/networkSlice";
import { store } from "../../store/store";

interface NetworkUsage {
	key: string;
	bytesIn: number;
	bytesOut: number;
}
interface PeerDetailsProps {
	peerId: string;
}

export const PeerDetails = ({ peerId }: PeerDetailsProps) => {
	const selectItemById = makeSelectItemById();
	const peer = selectItemById(store.getState(), peerId);

	const joinInOutObjects = (inObj: any, outObj: any): NetworkUsage[] => {
		let inKeys = Object.keys(inObj);
		let outKeys = Object.keys(outObj);

		const mergedSet = new Set([...inKeys, ...outKeys]);
		const allKeys = Array.from(mergedSet);

		let result: NetworkUsage[] = [];

		allKeys.forEach((key) => {
			let bin = inObj[key] | 0;
			let bout = outObj[key] | 0;

			result.push({
				key: key,
				bytesIn: bin,
				bytesOut: bout
			});
		});

		return result;
	};

	const renderField = (name: string, value: string) => {
		if (value != "") {
			return (
				<div className="flex flex-row">
					<p className="my-4 font-bold">{name + ":"}</p>
					<div className="w-2"></div>
					<p className="my-4 break-all">{value}</p>
				</div>
			);
		} else {
			return null;
		}
	};

	const renderCapabilityNetworkUsage = () => {
		let result = joinInOutObjects(peer.network.capBytesIn, peer.network.capBytesOut);
		return renderNetworkUsageTable(result);
	};

	const renderTypeNetworkUsage = () => {
		let result = joinInOutObjects(peer.network.typeBytesIn, peer.network.typeBytesOut);
		return renderNetworkUsageTable(result);
	};

	const renderNetworkUsageTable = (usage: NetworkUsage[]) => {
		return (
			<table className="table-auto text-left w-full">
				<thead>
					<tr className="border-b font-bold">
						<th>Type</th>
						<th>In</th>
						<th>Out</th>
					</tr>
				</thead>
				<tbody>
					{usage.map((item) => (
						<tr
							className="border-b"
							key={item.key}
						>
							<td>{item.key}</td>
							<td>{multipleBytes(item.bytesIn)}</td>
							<td>{multipleBytes(item.bytesOut)}</td>
						</tr>
					))}
				</tbody>
			</table>
		);
	};

	const renderMainInfo = () => {
		return (
			<table className="table-auto text-left w-full">
				<thead></thead>
				<tbody>
					{renderMainInfoRow("ID", peer.id)}
					{renderMainInfoRow("Name", peer.name)}
					{renderMainInfoRow("protocols", peer.protocols)}
					{renderMainInfoRow("enr", peer.enr)}
					{renderMainInfoRow("Enode", peer.enode)}
					{renderMainInfoRow("Cient", peer.name)}
					{renderMainInfoRow("caps", peer.caps.toString())}
					{renderMainInfoRow("local address", peer.network.localAddress)}
					{renderMainInfoRow("remote address", peer.network.remoteAddress)}
					{renderMainInfoRow("In", multipleBytes(peer.network.bytesIn))}
					{renderMainInfoRow("Out", multipleBytes(peer.network.bytesOut))}
					{renderMainInfoRow("In speed", multipleBps(peer.network.inRate))}
					{renderMainInfoRow("Out speed", multipleBps(peer.network.outRate))}
				</tbody>
			</table>
		);
	};

	const renderMainInfoRow = (name: string, value: string) => {
		return (
			<tr
				className="border-b"
				key={name}
			>
				<td>{name + ": "}</td>
				<td>{value}</td>
			</tr>
		);
	};

	const convertPid = (pid: string): string => {
		let result = pid;
		let charsArray = pid.split("");
		if (charsArray.length > 10) {
			result = pid.slice(0, 4) + "..." + pid.slice(-4);
		}

		return result;
	};

	return (
		<div className="relative flex flex-col w-max bg-white outline-none focus:outline-none items-center">
			<h3 className="text-3xl font-semibold mt-5">{"Peer: " + convertPid(peer.id)}</h3>
			<div className="flex flex-col relative p-6 flex-auto justify-center items-center max-h-[70vh] overflow-scroll">
				<p className="font-bold underline">Main info :</p>
				{renderMainInfo()}
				<div className="h-5" />
				<p className="font-bold underline">Network Usage By Capability :</p>
				{renderCapabilityNetworkUsage()}
				<div className="h-5" />
				<p className="font-bold underline">Network Usage By Type :</p>
				{renderTypeNetworkUsage()}
			</div>
		</div>
	);
};
