import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { selectActiveNodeId } from "./appSlice";
import { Time } from "../../helpers/time";

export interface NodeBootnode {
	nodeId: string;
	bootnodes: string[];
}

export interface NodePeers {
	nodeId: string;
	peers: Peer[];
}

export interface NetworkDiagramData {
	time: number;
	active: number;
	static: number;
	total: number;
	inRate: number;
	networkIn: number;
	outRate: number;
	networkOut: number;
	totalNetwork: number;
}

export interface Peer {
	enr: string;
	enode: string;
	id: string;
	name: string;
	caps: string[];
	network: Network;
	protocols: any;
	active: boolean;
	type: string;
	lastUpdateTime: number;
	diagramData: NetworkDiagramData[];
}

export interface Network {
	localAddress: string;
	remoteAddress: string;
	inbound: boolean;
	trusted: boolean;
	static: boolean;
	bootnode: boolean;
	bytesIn: number;
	bytesOut: number;
	sCountedBytesIn: number;
	sCountedBytesOut: number;
	inRate: number;
	outRate: number;
	capBytesIn: any;
	capBytesOut: any;
	typeBytesIn: any;
	typeBytesOut: any;
}

export interface PeersStatistics {
	activePeers: number;
	totalPeers: number;
	staticPeers: number;
	totalErrors: number;
	totalInBytes: number;
	totalOutBytes: number;
	totalInRate: number;
	totalOutRate: number;
}

export interface NetworkState {
	peers: NodePeers[];
	bootnodes: NodeBootnode[];
	diagramData: NetworkDiagramData[];
	diagramTime: number;
	testPeersMsgIdx: number;
}

const initialState: NetworkState = {
	peers: [],
	bootnodes: [],
	diagramTime: 0,
	diagramData: [],
	testPeersMsgIdx: 0
};

export const networkSlice = createSlice({
	name: "network",
	initialState,
	reducers: {
		addOrUpdatePeer: (state, action: PayloadAction<{ peer: Peer; nodeId: string }>) => {
			const { nodeId: activeNodeId, peer: peerToAdd } = action.payload;
			peerToAdd.lastUpdateTime = Date.now();

			// Helper function to create diagram data
			const createDiagramData = (peer: Peer): NetworkDiagramData => ({
				time: state.diagramTime,
				active: peer.active ? 1 : 0,
				static: peer.network.static ? 1 : 0,
				total: 1,
				inRate: peer.network.inRate || 0,
				networkIn: peer.network.bytesIn,
				outRate: peer.network.outRate || 0,
				networkOut: peer.network.bytesOut,
				totalNetwork: peer.network.bytesIn + peer.network.bytesOut
			});

			// Find the index of the node in the peers list
			const nodeIdx = state.peers.findIndex((node) => node.nodeId === activeNodeId);

			// Update rates and byte counts based on previous peer state
			const updateNetworkRates = (existingPeer: Peer, newPeer: Peer) => {
				const timeDiffSeconds = (newPeer.lastUpdateTime - existingPeer.lastUpdateTime) / Time.second;
				newPeer.network.inRate = newPeer.network.bytesIn / timeDiffSeconds;
				newPeer.network.outRate = newPeer.network.bytesOut / timeDiffSeconds;
				newPeer.network.sCountedBytesIn = existingPeer.network.sCountedBytesIn;
				newPeer.network.sCountedBytesOut = existingPeer.network.sCountedBytesOut;
				newPeer.network.bytesIn += existingPeer.network.bytesIn;
				newPeer.network.bytesOut += existingPeer.network.bytesOut;
			};

			if (nodeIdx !== -1) {
				const peerIdx = state.peers[nodeIdx].peers.findIndex((peer) => peer.id === peerToAdd.id);

				if (peerIdx !== -1) {
					// Existing peer, update network rates and diagram data
					updateNetworkRates(state.peers[nodeIdx].peers[peerIdx], peerToAdd);

					const diagramData = createDiagramData(peerToAdd);
					peerToAdd.diagramData = peerToAdd.diagramData.concat(state.peers[nodeIdx].peers[peerIdx].diagramData, diagramData);

					// Merge totals for capBytesIn, capBytesOut, typeBytesIn, typeBytesOut
					mergeObjValue(state.peers[nodeIdx].peers[peerIdx].network, peerToAdd.network, "capBytesIn");
					mergeObjValue(state.peers[nodeIdx].peers[peerIdx].network, peerToAdd.network, "capBytesOut");
					mergeObjValue(state.peers[nodeIdx].peers[peerIdx].network, peerToAdd.network, "typeBytesIn");
					mergeObjValue(state.peers[nodeIdx].peers[peerIdx].network, peerToAdd.network, "typeBytesOut");

					// Replace the old peer with the updated one
					state.peers[nodeIdx].peers[peerIdx] = peerToAdd;
				} else {
					// New peer for existing node, add diagram data and push to peers list
					peerToAdd.diagramData.push(createDiagramData(peerToAdd));
					state.peers[nodeIdx].peers.push(peerToAdd);
				}
			} else {
				// New node entirely, add it to the peers list with diagram data
				peerToAdd.diagramData.push(createDiagramData(peerToAdd));
				state.peers.push({
					nodeId: activeNodeId,
					peers: [peerToAdd]
				});
			}
		},
		addOrUpdateBootnodes: (state, action: PayloadAction<NodeBootnode>) => {
			let nodeIdx = state.bootnodes.findIndex((bootnode) => bootnode.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.bootnodes[nodeIdx] = action.payload;
			} else {
				state.bootnodes.push(action.payload);
			}
		},
		increaseDiagramTime: (state) => {
			state.diagramTime++;
		},
		setTestPeersMsgIdx: (state, action: PayloadAction<number>) => {
			state.testPeersMsgIdx = action.payload;
		},
		resetNetworkStateToMockState: () => initialState
	}
});

const mergeObjValue = (existingObject: any, newObject: any, valueKey: string): void => {
	let obj = existingObject[valueKey];
	let keys = Object.keys(obj);

	if (keys.length > 0) {
		keys.forEach((key) => {
			let val = 0;
			if (typeof obj[key] === "number") {
				let existingVal = existingObject[valueKey][key] || 0;
				val = newObject[valueKey][key] || 0;

				newObject[valueKey][key] = val + existingVal;
			}
		});
	}
};

export const { resetNetworkStateToMockState, addOrUpdatePeer, addOrUpdateBootnodes, increaseDiagramTime, setTestPeersMsgIdx } = networkSlice.actions;

export const selectPeers = (state: RootState): NodePeers[] => state.network.peers;
export const selectBootnodes = (state: RootState): NodeBootnode[] => state.network.bootnodes;

export const selectPeersForActiveNode = createSelector([selectPeers, selectActiveNodeId], (peers, activeNodeId): Peer[] => {
	const nodePeers = peers.find((p) => p.nodeId === activeNodeId);
	return nodePeers ? nodePeers.peers : ([] as Peer[]);
});

export const makeSelectItemById = () =>
	createSelector([selectPeersForActiveNode, (_, peerId: string) => peerId], (peers, peerId) => {
		return peers.find((p) => p.id === peerId) || ({} as Peer);
	});

export const selectSentryPeersForNode = createSelector([selectPeersForActiveNode], (peers): Peer[] => {
	return selectPeersByType("Sentry", peers);
});

export const selectSentinelPeersForNode = createSelector([selectPeersForActiveNode], (peers): Peer[] => {
	return selectPeersByType("Sentinel", peers);
});

const selectPeersByType = (type: string, peers: Peer[]): Peer[] => {
	const typeLowerCase = type.toLowerCase();
	return peers.filter((p) => p.type.toLowerCase() === typeLowerCase);
};

export const selectSentryActivePeersForNode = createSelector([selectSentryPeersForNode], (peers): Peer[] => {
	return selectActivePeers(peers);
});

export const selectSentinelActivePeersForNode = createSelector([selectSentinelPeersForNode], (peers): Peer[] => {
	return selectActivePeers(peers);
});

const selectActivePeers = (peers: Peer[]): Peer[] => {
	return peers.filter((peer) => peer.active);
};

export const selectSentryStaticPeersForNode = createSelector([selectSentryPeersForNode], (peers): Peer[] => {
	return selectStaticPeers(peers);
});

export const selectSentinelStaticPeersForNode = createSelector([selectSentinelPeersForNode], (peers): Peer[] => {
	return selectStaticPeers(peers);
});

const selectStaticPeers = (peers: Peer[]): Peer[] => {
	return peers.filter((peer) => peer.network.static);
};

export const selectSentryPeersStatistics = createSelector([selectSentryPeersForNode], (peers): PeersStatistics => {
	return selectPeersStatistics(peers);
});

export const selectSentinelPeersStatistics = createSelector([selectSentinelPeersForNode], (peers): PeersStatistics => {
	return selectPeersStatistics(peers);
});

const selectPeersStatistics = (peers: Peer[]): PeersStatistics => {
	return peers.reduce(
		(acc, peer) => {
			acc.totalInBytes += peer.network.bytesIn;
			acc.totalOutBytes += peer.network.bytesOut;
			acc.totalInRate += peer.network.inRate;
			acc.totalOutRate += peer.network.outRate;

			if (peer.active) acc.activePeers++;
			if (peer.network.static) acc.staticPeers++;

			return acc;
		},
		// Initial accumulator value
		{
			activePeers: 0,
			totalPeers: peers.length,
			staticPeers: 0,
			totalErrors: 0, // Will be calculated later
			totalInBytes: 0,
			totalOutBytes: 0,
			totalInRate: 0,
			totalOutRate: 0
		} as PeersStatistics
	);
};

export const selectDiagramTime = (state: RootState): number => state.network.diagramTime;

export const selectNetworkDiagramDataForNode = createSelector(
	[selectPeersForActiveNode, selectDiagramTime],
	(peers, diagramTime): NetworkDiagramData[] => {
		return Array.from({ length: diagramTime }, (_, timeIndex) => {
			return peers.reduce(
				(acc, peer) => {
					// Filter diagram data entries that match the current time index
					const matchingData = peer.diagramData.filter((data) => data.time === timeIndex);

					// Aggregate values for the current time index
					matchingData.forEach((data) => {
						acc.active += data.active;
						acc.static += data.static;
						acc.total += data.total;
						acc.inRate += data.inRate;
						acc.networkIn += data.networkIn;
						acc.outRate += data.outRate;
						acc.networkOut += data.networkOut;
						acc.totalNetwork += data.totalNetwork;
					});

					return acc;
				},
				// Initial accumulator value for each time index
				{
					time: timeIndex,
					active: 0,
					static: 0,
					total: 0,
					inRate: 0,
					networkIn: 0,
					outRate: 0,
					networkOut: 0,
					totalNetwork: 0
				} as NetworkDiagramData
			);
		});
	}
);

export default networkSlice.reducer;
