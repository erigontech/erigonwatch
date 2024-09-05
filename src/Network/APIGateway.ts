import {
	addOrUpdateCmdLineArgs,
	addOrUpdateNodeLogs,
	addOrUpdateNodeFlags,
	addOrUpdateNodeVersion,
	addOrUpdateSyncStages,
	LogFile,
	DataBase,
	addOrUpdateDBs,
	DataBaseTable,
	addOrUpdateDBTable,
	updateNodesInfoInCurrentSession,
	Reorg,
	addOrUpdateReorg
} from "../app/store/appSlice";
import {
	fetchBackendUrl,
	fetchBootnodes,
	fetchCmdLineArgs,
	fetchCpuUsage,
	fetchDB,
	fetchDBList,
	fetchFlags,
	fetchHardwareInfo,
	fetchHeaders,
	fetchLogFilesList,
	fetchMemoryInfo,
	fetchNetworkSpeed,
	fetchNodeInfo,
	fetchPeers,
	fetchProcessesInfo,
	fetchReorgs,
	fetchSession,
	fetchSnapshotFilesList,
	fetchSnapshotSync,
	fetchSyncStages,
	fetchVersion,
	logListUrl
} from "./APIHandler";
import { nodeInfoFromJson, nodeInfoFromJsonLocal } from "../helpers/nodeInfoFromJson";
import { flagsFromJson } from "../helpers/flagsFromJson";
import { versionFromJson } from "../helpers/versionFromJson";
import { syncStagesFromJson } from "../helpers/syncStagesFromJson";
import { store } from "../app/store/store";
import { NodeInfo } from "../entities";
import { peerFromJson } from "../helpers/peerFromJson";
import { Peer, addOrUpdatePeer, addOrUpdateBootnodes } from "../app/store/networkSlice";
import { snapshotDownloadStatusFromJson, snapshotIndexStatusFromJson } from "../helpers/snapshoSyncFromJson";
import {
	SnapshotDownloadStatus,
	SnapshotIndexingStatus,
	SyncStage,
	setNodeSyncStages,
	setSnapshotDownloadStatus,
	setSnapshotFilesList,
	setSnapshotIndexStatus
} from "../app/store/syncStagesSlice";
import { addOrUpdateHeaders } from "../app/store/headersSlice";
import { headersFromJson } from "../helpers/headersFromJson";
import {
	CPUInfo,
	CPUUsage,
	NetworkSpeed,
	ProcessesInfo,
	addOrUpdateCPUInfo,
	addOrUpdateCPUUsage,
	addOrUpdateDiskInfo,
	addOrUpdateNetworkSpeed,
	addOrUpdateProcessesInfo,
	addOrUpdateRAMInfo,
	addOrUpdateRAMUsage
} from "../app/store/systemInfoSlice";
import { NodeConnectionType, setBackendAddress, setNodeConnectionType } from "../app/store/connectionSlice";

const getNodeId = (): string => {
	return store.getState().app.activeNodeId;
};

export const getBackendUrl = () => {
	fetchBackendUrl()
		.then((response) => {
			if (response.address != undefined) {
				let beAddr = response.address;
				store.dispatch(setNodeConnectionType(NodeConnectionType.Local));
				//Check is running from diag ui command
				if (response.address.includes("127.0.0.1") || response.address.includes("localhost")) {
					//Check for proxy
					if (!window.location.origin.includes("127.0.0.1") && !window.location.origin.includes("localhost")) {
						beAddr = window.location.origin + "/api";
					}
				}
				store.dispatch(setBackendAddress(beAddr));
			} else {
				store.dispatch(setNodeConnectionType(NodeConnectionType.Unknown));
			}
		})
		.catch((error) => {
			store.dispatch(setNodeConnectionType(NodeConnectionType.Remote));
		});
};

const getCurrentSnapshotDownloadStatus = (): SnapshotDownloadStatus | undefined => {
	let nodeId = getNodeId();

	for (let snapshotStatus of store.getState().syncStages.snapshotDownloadStatus) {
		if (snapshotStatus.nodeId === nodeId) {
			return snapshotStatus.downloadStatus;
		}
	}

	return undefined;
};

export const getSession = () => {
	fetchSession()
		.then((response) => {
			let nodes: NodeInfo[] = [];
			if (response?.nodes !== null) {
				response.nodes.forEach((node: any) => {
					nodes.push(nodeInfoFromJson(node));
				});
			}

			store.dispatch(updateNodesInfoInCurrentSession(nodes));
		})
		.catch((error) => {
			console.log("Error fetching session: ", error);
		});
};

export const getNodeInfo = () => {
	fetchNodeInfo()
		.then((response) => {
			let nodes: NodeInfo[] = [];
			if (response !== null && response.nodes_info.length > 0) {
				nodes.push(nodeInfoFromJsonLocal(response.nodes_info[0]));
			}

			store.dispatch(updateNodesInfoInCurrentSession(nodes));
		})
		.catch((error) => {
			console.log("Error fetching node info: ", error);
		});
};

export const getNodeVersion = () => {
	fetchVersion()
		.then((response: any) => {
			let nodeVersion = versionFromJson(response);
			store.dispatch(addOrUpdateNodeVersion({ nodeId: getNodeId(), version: nodeVersion }));
		})
		.catch((error) => {
			console.log("Error fetching version: ", error);
		});
};

export const getNodeFlags = () => {
	fetchFlags()
		.then((response: any) => {
			let flags = flagsFromJson(response);
			store.dispatch(addOrUpdateNodeFlags({ nodeId: getNodeId(), flags: flags }));
		})
		.catch((error) => {
			console.log("Error fetching flags: ", error);
		});
};

export const getNodeCmdLineArgs = () => {
	fetchCmdLineArgs()
		.then((response: any) => {
			store.dispatch(addOrUpdateCmdLineArgs({ nodeId: getNodeId(), args: response }));
		})
		.catch((error) => {
			console.log("Error fetching cmd line args: ", error);
		});
};

export const getSyncStages = () => {
	fetchSyncStages()
		.then((response) => {
			store.dispatch(addOrUpdateSyncStages({ nodeId: getNodeId(), syncStages: syncStagesFromJson(response) }));
		})
		.catch((error) => {
			console.log("Error fetching sync stages: ", error);
		});
};

export const getLogs = () => {
	fetchLogFilesList()
		.then((response) => {
			let logFiles: LogFile[] = [];
			response.forEach((logFile: any) => {
				if (logFile.name.endsWith(".log")) {
					const baseurl = logListUrl();
					const url = `${baseurl}/${logFile.name}`;
					logFiles.push({ name: logFile.name, size: logFile.size, url: url, selected: false });
				}
			});
			store.dispatch(addOrUpdateNodeLogs({ nodeId: getNodeId(), logFiles: logFiles }));
		})
		.catch((error) => {
			console.log("Error fetching logs: ", error);
		});
};

export const getDBsList = () => {
	fetchDBList()
		.then((dataBasePathList) => {
			let dataBases: DataBase[] = [];
			dataBasePathList.forEach((dataBasePath: any) => {
				dataBases.push({ path: dataBasePath, tables: [], keysCount: 0, size: 0 });
			});

			store.dispatch(addOrUpdateDBs({ nodeId: getNodeId(), dbs: dataBases }));
		})
		.catch((error) => {
			console.log("Error fetching DBs: ", error);
		});
};

export const getDB = (dbPath: string) => {
	fetchDB(dbPath)
		.then((tables) => {
			let keysCount = 0;
			let size = 0;
			let dbTables: DataBaseTable[] = [];
			tables.forEach((table: any) => {
				keysCount += table.count;
				size += table.size;
				dbTables.push({
					name: table.name,
					count: table.count,
					size: table.size
				});
			});
			store.dispatch(addOrUpdateDBTable({ nodeId: getNodeId(), path: dbPath, tables: dbTables, keysCount: keysCount, size: size }));
		})
		.catch((error) => {
			console.log("Error fetching DB: ", error);
		});
};

export const getReorgs = () => {
	fetchReorgs()
		.then((response) => {
			let wb: number[] = [];
			if (response.WrongBlocks !== null) {
				response.WrongBlocks.forEach((block: number) => {
					wb.push(block);
				});
			}

			let reorg: Reorg = {
				nodeId: getNodeId(),
				totalBlocks: response.TotalScanned,
				wrongBlocks: wb,
				timeTook: response.TimeTook
			};

			store.dispatch(addOrUpdateReorg(reorg));
		})
		.catch((error) => {
			console.log("Error fetching reorgs: ", error);
		});
};

//TODO: think about refactore bootnodes / peers relationship
export const getPeers = () => {
	const activeNodeId = getNodeId();
	const nodeIdx = store.getState().network.bootnodes.findIndex((bootnode) => bootnode.nodeId === activeNodeId);
	let bootnodes: string[] = [];

	if (nodeIdx !== -1) {
		bootnodes = store.getState().network.bootnodes[nodeIdx].bootnodes;
	}

	fetchPeers()
		.then((peers) => {
			peers.forEach((val: any) => {
				let peer: Peer = peerFromJson(val, bootnodes);
				store.dispatch(addOrUpdatePeer({ peer: peer, nodeId: getNodeId() }));
			});
		})
		.catch((error) => {
			console.log("Error fetching peers: ", error);
		});
};

export const getBootnodes = () => {
	fetchBootnodes()
		.then((bootnodes) => {
			store.dispatch(addOrUpdateBootnodes({ nodeId: getNodeId(), bootnodes: bootnodes }));
		})
		.catch((error) => {
			console.log("Error fetching bootnodes: ", error);
		});
};

export const getSnapshotDownloadStatus = () => {
	fetchSnapshotSync()
		.then((response) => {
			if (response) {
				let currDStats = getCurrentSnapshotDownloadStatus();
				let segCount = 0;
				if (currDStats) {
					currDStats.segments.forEach((seg) => {
						if (!seg.name.includes("beaconblocks")) {
							segCount++;
						}
					});
				}
				let indexingStatus: SnapshotIndexingStatus = snapshotIndexStatusFromJson(response.snapshotIndexing, segCount);
				let downloadStatus: SnapshotDownloadStatus = snapshotDownloadStatusFromJson(response.snapshotDownload, currDStats, indexingStatus);

				//not correct stages, need to remove -1 fail on execution

				if (response.syncStages != null) {
					if (response.syncStages.length != 0) {
						store.dispatch(setNodeSyncStages({ nodeId: getNodeId(), stages: response.syncStages as SyncStage[] }));
					}
				}

				store.dispatch(setSnapshotIndexStatus({ nodeId: getNodeId(), indexStatus: indexingStatus }));
				store.dispatch(setSnapshotDownloadStatus({ nodeId: getNodeId(), downloadStatus: downloadStatus }));
			}
		})
		.catch((error) => {
			console.log("Error fetching snapshot download status: ", error);
		});
};

export const getSnapshotFilesList = () => {
	fetchSnapshotFilesList()
		.then((response) => {
			store.dispatch(setSnapshotFilesList({ nodeId: getNodeId(), files: response.files }));
		})
		.catch((error) => {
			console.log("Error fetching snapshot files list: ", error);
		});
};

export const getHeaders = () => {
	fetchHeaders()
		.then((response) => {
			const hdrs = headersFromJson(response);
			store.dispatch(addOrUpdateHeaders({ nodeId: getNodeId(), headers: hdrs }));
		})
		.catch((error) => {
			console.log("Error fetching headers: ", error);
		});
};

export const getNetworkSpeed = () => {
	fetchNetworkSpeed()
		.then((response) => {
			let networkSpeed: NetworkSpeed = {
				latency: response?.latency || 0,
				downloadSpeed: response?.downloadSpeed || 0,
				uploadSpeed: response?.uploadSpeed || 0
			};

			store.dispatch(addOrUpdateNetworkSpeed({ nodeId: getNodeId(), networkSpeed: networkSpeed }));
		})
		.catch((error) => {
			console.log("Error fetching network speed: ", error);
		});
};

export const getHardwareInfo = () => {
	fetchHardwareInfo()
		.then((response) => {
			let cpuInfo: CPUInfo[] = [];

			response.cpu.forEach((cpu: any) => {
				cpuInfo.push({
					cpu: cpu.cpu,
					vendorId: cpu.vendorId,
					family: cpu.family,
					model: cpu.model,
					stepping: cpu.stepping,
					physicalId: cpu.physicalId,
					coreId: cpu.coreId,
					cores: cpu.cores,
					modelName: cpu.modelName,
					mhz: cpu.mhz,
					cacheSize: cpu.cacheSize,
					flags: cpu.flags,
					microcode: cpu.microcode
				});
			});

			store.dispatch(addOrUpdateCPUInfo({ nodeId: getNodeId(), info: cpuInfo }));
			store.dispatch(addOrUpdateRAMInfo({ nodeId: getNodeId(), info: response.ram }));
			store.dispatch(addOrUpdateDiskInfo({ nodeId: getNodeId(), info: response.disk }));
		})
		.catch((error) => {
			console.log("Error fetching hardware info: ", error);
		});
};

export const getCpuUsage = () => {
	fetchCpuUsage()
		.then((response) => {
			let cores: number[] = [];
			response.Cores.forEach((cpu: any) => {
				cores.push(cpu);
			});

			let cpuUsage: CPUUsage = {
				total: response.Total,
				cores: cores
			};
			store.dispatch(addOrUpdateCPUUsage({ nodeId: getNodeId(), usage: cpuUsage }));
		})
		.catch((error) => {
			console.log("Error fetching CPU usage: ", error);
		});
};

export const getProcessesInfo = () => {
	fetchProcessesInfo()
		.then((response) => {
			let prcs: ProcessesInfo[] = [];
			response.forEach((prc: any) => {
				prcs.push({
					pid: prc.Pid,
					name: prc.Name,
					cpuUsage: prc.CPUUsage,
					memory: prc.Memory
				});
			});

			store.dispatch(addOrUpdateProcessesInfo({ nodeId: getNodeId(), info: prcs }));
		})
		.catch((error) => {
			console.log("Error fetching processes info: ", error);
		});
};

export const getMemoryInfo = () => {
	fetchMemoryInfo()
		.then((response) => {
			store.dispatch(addOrUpdateRAMUsage({ nodeId: getNodeId(), usage: response }));
		})
		.catch((error) => {
			console.log("Error fetching memory info: ", error);
		});
};
