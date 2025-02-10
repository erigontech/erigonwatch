import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { selectActiveNodeId } from "./appSlice";

export enum StageState {
	Queued = 0,
	Running = 1,
	Completed = 2
}

export interface NodeSnapshotDownloadStatus {
	nodeId: string;
	downloadStatus: SnapshotDownloadStatus;
}

export interface SnapshotDownloadStatus {
	downloaded: number;
	total: number;
	totalTime: number[];
	downloadRate: number;
	uploadRate: number;
	peers: number;
	files: number;
	connections: number;
	alloc: number;
	sys: number;
	downloadFinished: boolean;
	indexingFinished: boolean;
	segments: SnapshotSegmentDownloadStatus[];
	indexed: number;
	torrentMetadataReady: number;
	diagramData: ShapshotDiagramData[];
}

export interface SnapshotSegmentDownloadStatus {
	name: string;
	totalBytes: number;
	downloadedBytes: number;
	webseeds: SegmentPeer[];
	peers: SegmentPeer[];
	indexed: number;
	downloadedStats: DownloadedStats | null;
}

export interface DownloadedStats {
	timeTook: number;
	averageRate: number;
}

export interface SegmentPeer {
	url: string;
	downloadRate: number;
	uploadRate: number;
	remoteAddr: string;
	peerId: number[];
	piecesCount: number;
	torrentName: string;
}

export interface NodeSnapshotIndexStatus {
	nodeId: string;
	indexStatus: SnapshotIndexingStatus;
}

export interface SnapshotIndexingStatus {
	totalTime: number[];
	segments: SnapshotSegmentIndexStatus[];
	progress: number;
	alloc: number;
	sys: number;
}

export interface SnapshotSegmentIndexStatus {
	name: string;
	progress: number;
}

export interface NodeSyncStage {
	nodeId: string;
	stages: SyncStage[];
}

export interface SyncStage {
	id: string;
	state: StageState;
	subStages: SyncSubStage[];
}

export interface SyncSubStage {
	id: string;
	state: StageState;
}

export interface NodeSnapshotFileList {
	nodeId: string;
	files: string[];
}

export interface NodeBlockExecution {
	nodeId: string;
	files: BlockExecution[];
}

export interface BlockExecution {
	from: number;
	to: number;
	blockNumber: number;
	blkPerSec: number;
	txPerSec: number;
	mgasPerSec: number;
	gasState: number;
	batch: number;
	alloc: number;
	sys: number;
	timeElapsed: number;
}

export interface NodeSegmentPeerDiagData {
	nodeId: string;
	data: SegmentPeerDiagData[];
}

export interface SegmentPeerDiagData {
	peerId: string;
	diagramData: PeerDiagramData[];
}

export interface SegmentPeerDiagValues {
	value: number;
	time: number;
}

export interface PeerDiagramData {
	time: number;
	pieces: number;
	dLspeed: number;
	uPspeed: number;
}

export interface ShapshotDiagramData {
	time: number;
	downloaded: number;
	total: number;
	downloadRate: number;
	uploadRate: number;
	connections: number;
	alloc: number;
	sys: number;
	pieces: number;
}

export interface SyncStagesState {
	snapshotFilesList: NodeSnapshotFileList[];
	snapshotDownloadStatus: NodeSnapshotDownloadStatus[];
	snapshotIndexStatus: NodeSnapshotIndexStatus[];
	syncStages: NodeSyncStage[];
	testSnpSyncMsgIdx: number;
	peersDiagramData: NodeSegmentPeerDiagData[];
	diagramTime: number;
}

const initialState: SyncStagesState = {
	snapshotFilesList: [],
	snapshotDownloadStatus: [],
	snapshotIndexStatus: [],
	syncStages: [],
	//testSnpSyncMsgIdx: 439
	testSnpSyncMsgIdx: 0,
	peersDiagramData: [],
	diagramTime: 0
};

export const syncStagesSlice = createSlice({
	name: "syncStages",
	initialState,
	reducers: {
		setSnapshotFilesList: (state, action: PayloadAction<NodeSnapshotFileList>) => {
			let nodeIdx = state.snapshotFilesList.findIndex((fileList) => fileList.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.snapshotFilesList[nodeIdx].files = action.payload.files;
			} else {
				state.snapshotFilesList.push(action.payload);
			}
		},
		setSnapshotDownloadStatus: (state, action: PayloadAction<NodeSnapshotDownloadStatus>) => {
			let totalPieces = 0;

			let nodeIdx = state.snapshotDownloadStatus.findIndex((downloadStatus) => downloadStatus.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				action.payload.downloadStatus.segments.forEach((segment) => {
					segment.peers.forEach((peer) => {
						if (peer.peerId === undefined) {
							return;
						}

						totalPieces += peer.piecesCount;
						let peerIdx = state.peersDiagramData[nodeIdx].data.findIndex(
							(peersDiagramData) => peersDiagramData.peerId.toString() === peer.peerId.toString()
						);

						if (peerIdx !== -1) {
							state.peersDiagramData[nodeIdx].data[peerIdx].diagramData.push({
								time: state.diagramTime,
								pieces: peer.piecesCount,
								dLspeed: peer.downloadRate,
								uPspeed: peer.uploadRate
							});
						} else {
							let peerDiagData: SegmentPeerDiagData = {
								peerId: peer.peerId.toString(),
								diagramData: Array<PeerDiagramData>({
									time: state.diagramTime,
									pieces: peer.piecesCount,
									dLspeed: peer.downloadRate,
									uPspeed: peer.uploadRate
								})
							};
							state.peersDiagramData[nodeIdx].data.push(peerDiagData);
						}
					});
				});
			} else {
				let arr = Array<SegmentPeerDiagData>();
				action.payload.downloadStatus.segments.forEach((segment) => {
					segment.peers.forEach((peer) => {
						if (peer.peerId === undefined) {
							return;
						}
						totalPieces += peer.piecesCount;
						let peerIdx = arr.findIndex((peersDiagramData) => peersDiagramData.peerId.toString() === peer.peerId.toString());
						if (peerIdx !== -1) {
							arr[peerIdx].diagramData.push({
								time: state.diagramTime,
								pieces: peer.piecesCount,
								dLspeed: peer.downloadRate,
								uPspeed: peer.uploadRate
							});
						} else {
							let peerDiagData: SegmentPeerDiagData = {
								peerId: peer.peerId.toString(),
								diagramData: Array<PeerDiagramData>({
									time: state.diagramTime,
									pieces: peer.piecesCount,
									dLspeed: peer.downloadRate,
									uPspeed: peer.uploadRate
								})
							};
							arr.push(peerDiagData);
						}
					});
				});

				state.peersDiagramData.push({ nodeId: action.payload.nodeId, data: arr });
			}

			let diagramData = {
				time: state.diagramTime,
				downloaded: action.payload.downloadStatus.downloaded,
				total: action.payload.downloadStatus.total,
				downloadRate: action.payload.downloadStatus.downloadRate,
				uploadRate: action.payload.downloadStatus.uploadRate,
				connections: action.payload.downloadStatus.connections,
				alloc: action.payload.downloadStatus.alloc,
				sys: action.payload.downloadStatus.sys,
				pieces: totalPieces
			};

			if (nodeIdx !== -1) {
				let prevStatus = state.snapshotDownloadStatus[nodeIdx].downloadStatus.diagramData;
				prevStatus.push(diagramData);
				action.payload.downloadStatus.diagramData = prevStatus;
				state.snapshotDownloadStatus[nodeIdx].downloadStatus = action.payload.downloadStatus;
			} else {
				action.payload.downloadStatus.diagramData = Array<ShapshotDiagramData>(diagramData);
				state.snapshotDownloadStatus.push(action.payload);
			}

			state.diagramTime += 1;
		},
		setSnapshotIndexStatus: (state, action: PayloadAction<NodeSnapshotIndexStatus>) => {
			let nodeIdx = state.snapshotIndexStatus.findIndex((indexStatus) => indexStatus.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.snapshotIndexStatus[nodeIdx].indexStatus = action.payload.indexStatus;
			} else {
				state.snapshotIndexStatus.push(action.payload);
			}
		},
		setNodeSyncStages: (state, action: PayloadAction<NodeSyncStage>) => {
			let nodeIdx = state.syncStages.findIndex((syncStage) => syncStage.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.syncStages[nodeIdx] = action.payload;
			} else {
				state.syncStages.push(action.payload);
			}
		},
		setTestSnpSyncMsgIdx: (state, action: PayloadAction<number>) => {
			state.testSnpSyncMsgIdx = action.payload;
		},
		resetSyncStagesState: () => initialState
	}
});

export const {
	setSnapshotFilesList,
	resetSyncStagesState,
	setSnapshotDownloadStatus,
	setSnapshotIndexStatus,
	setNodeSyncStages,
	setTestSnpSyncMsgIdx
} = syncStagesSlice.actions;

export const selectSnapshotDownloadStatus = (state: RootState): NodeSnapshotDownloadStatus[] => state.syncStages.snapshotDownloadStatus;
export const selectSnapshotDownloadStatusesForNode = createSelector(
	[selectSnapshotDownloadStatus, selectActiveNodeId],
	(downloadStatus, activeNodeId): SnapshotDownloadStatus => {
		let result: SnapshotDownloadStatus = {} as SnapshotDownloadStatus;
		downloadStatus.forEach((status) => {
			if (status.nodeId === activeNodeId) {
				result = status.downloadStatus;
			}
		});

		return result;
	}
);

export const selectSegmentPeersDiagData = (state: RootState): NodeSegmentPeerDiagData[] => state.syncStages.peersDiagramData;
export const selectSegmentPeersDiagDataForNode = createSelector(
	[selectSegmentPeersDiagData, selectActiveNodeId],
	(segmentPeerDiagData, activeNodeId): SegmentPeerDiagData[] => {
		let result: SegmentPeerDiagData[] = [];
		segmentPeerDiagData.forEach((data) => {
			if (data.nodeId === activeNodeId) {
				result = data.data;
			}
		});

		return result;
	}
);

export const selectTorrrentPeersForNode = createSelector(
	[selectSnapshotDownloadStatus, selectActiveNodeId],
	(downloadStatus, activeNodeId): SegmentPeer[] => {
		let result: SegmentPeer[] = [] as SegmentPeer[];
		downloadStatus.forEach((status) => {
			if (status.nodeId === activeNodeId) {
				status.downloadStatus.segments.forEach((segment) => {
					result.push(...segment.peers);
				});
			}
		});

		const uniqueArray = [...new Set(result)];
		return uniqueArray;
	}
);

export const selectSnapshotIndexStatus = (state: RootState): NodeSnapshotIndexStatus[] => state.syncStages.snapshotIndexStatus;
export const selectSnapshotIndexStatusesForNode = createSelector(
	[selectSnapshotIndexStatus, selectActiveNodeId],
	(indexStatus, activeNodeId): SnapshotIndexingStatus => {
		let result: SnapshotIndexingStatus = {} as SnapshotIndexingStatus;
		indexStatus.forEach((status) => {
			if (status.nodeId === activeNodeId) {
				result = status.indexStatus;
			}
		});

		return result;
	}
);
export const selectSyncStages = (state: RootState): NodeSyncStage[] => state.syncStages.syncStages;
export const selectSyncStagesForNode = createSelector([selectSyncStages, selectActiveNodeId], (syncStages, activeNodeId): SyncStage[] => {
	let result: SyncStage[] = [];
	syncStages.forEach((stage) => {
		if (stage.nodeId === activeNodeId) {
			result = stage.stages;
		}
	});

	return result;
});

export const selectSnapshotFileList = (state: RootState): NodeSnapshotFileList[] => state.syncStages.snapshotFilesList;
export const selectSnapshotFileListForActiveNode = createSelector(
	[selectSnapshotFileList, selectActiveNodeId],
	(snapshotFileList, activeNodeId): string[] => {
		let result: string[] = [];
		snapshotFileList.forEach((list) => {
			if (list.nodeId === activeNodeId) {
				result = list.files;
			}
		});
		return result;
	}
);

export const selectShouldFetchSnapshotFilesListForActiveNode = createSelector([selectSnapshotFileListForActiveNode], (snapshotFileList): boolean => {
	if (snapshotFileList?.length === 0) {
		return true;
	} else {
		return false;
	}
});

export default syncStagesSlice.reducer;
