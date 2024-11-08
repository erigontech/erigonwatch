import { Network, Peer } from "../app/store/networkSlice";

export const peerFromJson = (json: any, bootnodes: string[]): Peer => {
	return {
		enr: json?.enr || "",
		enode: json?.enode || "",
		id: json.id,
		name: json.name,
		caps: json.caps,
		network: networkFromJson(json, bootnodes),
		protocols: json.protocols,
		type: json.type,
		lastUpdateTime: new Date().getTime(),
		diagramData: [],
		active: true //Set peer active by default as we are receiving only active peers from node, as soon as node don't return this particular peer, it will be set to inactive
	};
};

const networkFromJson = (json: any, bootnodes: string[]): Network => {
	return {
		localAddress: json.network.localAddress,
		remoteAddress: json.network.remoteAddress,
		inbound: json.network.inbound,
		trusted: json.network.trusted,
		static: json.network.static,
		bootnode: isBootnode(json.enr, bootnodes),
		bytesIn: json.network.bytesIn,
		bytesOut: json.network.bytesOut,
		capBytesIn: initObjectFromJson(json.network.capBytesIn),
		capBytesOut: initObjectFromJson(json.network.capBytesOut),
		typeBytesIn: initObjectFromJson(json.network.typeBytesIn),
		typeBytesOut: initObjectFromJson(json.network.typeBytesOut),
		inRate: 0,
		outRate: 0,
		sCountedBytesIn: 0,
		sCountedBytesOut: 0
	};
};

const isBootnode = (enode: string, bootnodes: string[]): boolean => {
	return bootnodes.includes(enode);
};

const initObjectFromJson = (json: any): any => {
	let map: Map<string, number> = new Map();
	for (let key in json) {
		map.set(key, json[key]);
	}

	const myObject: { [key: string]: number } = Object.fromEntries(map);
	return myObject;
};
