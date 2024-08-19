import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { selectActiveNodeId } from "./appSlice";

const initialState: SystemInfoState = {
	networkSpeed: [],
	ramInfo: [],
	cpuInfo: [],
	diskInfo: [],
	processesInfo: []
};

export interface SystemInfoState {
	networkSpeed: NodeNetworkSpeed[];
	ramInfo: NodeRAMInfo[];
	cpuInfo: NodeCPUInfo[];
	diskInfo: NodeDiskInfo[];
	processesInfo: NodeProcessesInfo[];
}

export interface NodeNetworkSpeed {
	nodeId: string;
	networkSpeed: NetworkSpeed;
}

export interface NetworkSpeed {
	latency: number;
	downloadSpeed: number;
	uploadSpeed: number;
}

export interface NodeRAMInfo {
	nodeId: string;
	info: RAMInfo;
}

export interface RAMInfo {
	total: number;
	available: number;
	used: number;
	usedPercent: number;
}

export interface NodeCPUInfo {
	nodeId: string;
	info: CPUInfo[];
	usage: CPUUsage;
}

export interface CPUUsage {
	total: number;
	cores: number[];
}

export interface CPUInfo {
	cpu: number;
	vendorId: string;
	family: string;
	model: string;
	stepping: number;
	physicalId: string;
	coreId: string;
	cores: number;
	modelName: string;
	mhz: number;
	cacheSize: number;
	flags: string[];
	microcode: string;
}

export interface NodeProcessesInfo {
	nodeId: string;
	processes: ProcessesInfo[];
}

export interface ProcessesInfo {
	pid: number;
	name: string;
	cpuUsage: number;
	memory: number;
}

export interface NodeDiskInfo {
	nodeId: string;
	info: DiskInfo;
}

export interface DiskInfo {
	fsType: string;
	total: number;
	free: number;
	mountPoint: string;
	device: string;
	details: string;
}

export const systemInfoSlice = createSlice({
	name: "systemInfo",
	initialState,
	reducers: {
		addOrUpdateNetworkSpeed: (state, action: PayloadAction<{ networkSpeed: NetworkSpeed; nodeId: string }>) => {
			let nodeIdx = state.networkSpeed.findIndex((issue) => issue.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.networkSpeed[nodeIdx].networkSpeed = action.payload.networkSpeed;
			} else {
				state.networkSpeed.push({ nodeId: action.payload.nodeId, networkSpeed: action.payload.networkSpeed });
			}
		},
		addOrUpdateRAMInfo: (state, action: PayloadAction<{ info: RAMInfo; nodeId: string }>) => {
			let nodeIdx = state.ramInfo.findIndex((issue) => issue.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.ramInfo[nodeIdx] = action.payload;
			} else {
				state.ramInfo.push({ nodeId: action.payload.nodeId, info: action.payload.info });
			}
		},
		addOrUpdateCPUInfo: (state, action: PayloadAction<{ info: CPUInfo[]; nodeId: string }>) => {
			let nodeIdx = state.cpuInfo.findIndex((issue) => issue.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.cpuInfo[nodeIdx].info = action.payload.info;
			} else {
				state.cpuInfo.push({ nodeId: action.payload.nodeId, info: action.payload.info, usage: { total: 0, cores: [] } });
			}
		},
		addOrUpdateCPUUsage: (state, action: PayloadAction<{ usage: CPUUsage; nodeId: string }>) => {
			let nodeIdx = state.cpuInfo.findIndex((issue) => issue.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.cpuInfo[nodeIdx].usage = action.payload.usage;
			} else {
				state.cpuInfo.push({ nodeId: action.payload.nodeId, info: [], usage: action.payload.usage });
			}
		},
		addOrUpdateDiskInfo: (state, action: PayloadAction<{ info: DiskInfo; nodeId: string }>) => {
			let nodeIdx = state.diskInfo.findIndex((issue) => issue.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.diskInfo[nodeIdx].info = action.payload.info;
			} else {
				state.diskInfo.push({ nodeId: action.payload.nodeId, info: action.payload.info });
			}
		},
		addOrUpdateProcessesInfo: (state, action: PayloadAction<{ info: ProcessesInfo[]; nodeId: string }>) => {
			let nodeIdx = state.processesInfo.findIndex((issue) => issue.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.processesInfo[nodeIdx].processes = action.payload.info;
			} else {
				state.processesInfo.push({ nodeId: action.payload.nodeId, processes: action.payload.info });
			}
		},
		addOrUpdateRAMUsage: (state, action: PayloadAction<{ usage: number; nodeId: string }>) => {
			let nodeIdx = state.ramInfo.findIndex((issue) => issue.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				state.ramInfo[nodeIdx].info.usedPercent = action.payload.usage;
			} else {
				state.ramInfo.push({ nodeId: action.payload.nodeId, info: { total: 0, available: 0, used: 0, usedPercent: action.payload.usage } });
			}
		},
		resetSystemInfoState: () => initialState
	}
});

export const {
	addOrUpdateNetworkSpeed,
	addOrUpdateCPUInfo,
	addOrUpdateDiskInfo,
	addOrUpdateProcessesInfo,
	addOrUpdateRAMInfo,
	addOrUpdateCPUUsage,
	addOrUpdateRAMUsage,
	resetSystemInfoState
} = systemInfoSlice.actions;

export const selectNodesNetworkSpeed = (state: RootState): NodeNetworkSpeed[] => state.sysInfo.networkSpeed;
export const selectNetworkSpeedForActiveNode = createSelector(
	[selectNodesNetworkSpeed, selectActiveNodeId],
	(nodeIssues, activeNodeId): NetworkSpeed => {
		let result: NetworkSpeed = {} as NetworkSpeed;
		nodeIssues.forEach((issue) => {
			if (issue.nodeId === activeNodeId) {
				result = issue.networkSpeed;
			}
		});
		return result;
	}
);

export const selectNodesRAMInfo = (state: RootState): NodeRAMInfo[] => state.sysInfo.ramInfo;
export const selectRAMInfoForActiveNode = createSelector([selectNodesRAMInfo, selectActiveNodeId], (nodeIssues, activeNodeId): RAMInfo => {
	let result: RAMInfo = {} as RAMInfo;
	nodeIssues.forEach((issue) => {
		if (issue.nodeId === activeNodeId) {
			result = issue.info;
		}
	});
	return result;
});

export const selectNodesCPUInfo = (state: RootState): NodeCPUInfo[] => state.sysInfo.cpuInfo;
export const selectCPUInfoForActiveNode = createSelector([selectNodesCPUInfo, selectActiveNodeId], (nodeIssues, activeNodeId): CPUInfo[] => {
	let result: CPUInfo[] = [];
	nodeIssues.forEach((issue) => {
		if (issue.nodeId === activeNodeId) {
			result = issue.info;
		}
	});
	return result;
});

export const selectCPUUsageForActiveNode = createSelector([selectNodesCPUInfo, selectActiveNodeId], (nodeIssues, activeNodeId): CPUUsage => {
	let result: CPUUsage = { total: 0, cores: [] };
	nodeIssues.forEach((issue) => {
		if (issue.nodeId === activeNodeId) {
			result = issue.usage;
		}
	});
	return result;
});

export const selectNodesDiskInfo = (state: RootState): NodeDiskInfo[] => state.sysInfo.diskInfo;
export const selectDiskInfoForActiveNode = createSelector([selectNodesDiskInfo, selectActiveNodeId], (nodeIssues, activeNodeId): DiskInfo => {
	let result: DiskInfo = {} as DiskInfo;
	nodeIssues.forEach((issue) => {
		if (issue.nodeId === activeNodeId) {
			result = issue.info;
		}
	});
	return result;
});

export const selectNodesProcessesInfo = (state: RootState): NodeProcessesInfo[] => state.sysInfo.processesInfo;
export const selectProcessesInfoForActiveNode = createSelector(
	[selectNodesProcessesInfo, selectActiveNodeId],
	(nodeIssues, activeNodeId): ProcessesInfo[] => {
		let result: ProcessesInfo[] = [];
		nodeIssues.forEach((issue) => {
			if (issue.nodeId === activeNodeId) {
				result = issue.processes;
			}
		});
		return result;
	}
);

export default systemInfoSlice.reducer;
