import { setIsConnectedToNode } from "../app/store/connectionSlice";
import { store } from "../app/store/store";
import { isLocalVersion } from "../helpers/env";
import {
	getBootnodesJsonMock,
	getCmdLineJsonMock,
	getDBListJsonMock,
	getDBTablesListJsonMock,
	getFlagsResponseJsonMock,
	getLogsListJsonMock,
	getReorgsJsonMock,
	getSessionResponseJsonMock,
	getSyncStagesResponseJsonMock,
	getVersionJsonMock,
	getSnapshotFilesListMock,
	getHeadersMock,
	getNetworkSpeedMock,
	nodeInfoMock,
	snpDLmock
} from "./../../tests/mocks";

import { cpuUsageMock, hardwareInfoMock, memoryInfoMock, processesInfoMock } from "../../tests/sysinfo_mock";
import { getPeersData, getSyncData } from "./mockData/SnapshotDownloadMock";
import { setTestSnpSyncMsgIdx } from "../app/store/syncStagesSlice";
import { setTestPeersMsgIdx } from "../app/store/networkSlice";

const sessionVarName = "sessions";
const nodeVarName = "nodes";
const versionVarName = "version";
const flagsVarName = "flags";
const cmdLineVarName = "cmdline";
const logsVarName = "logs";
const syncStagesVarName = "sync-stages";
const dbVarName = "dbs";
const tableVarName = "tables";
const reorgVarName = "reorgs";
const peersVarName = "peers";
const bootnodeVarName = "bootnodes";
const snapshotSyncVarName = "snapshot-sync";
const snapshotFilesListVarName = "snapshot-files-list";
const headersVarName = "headers";
const networkSpeedVarName = "network-speed";
const nodeInfoVarName = "nodeinfo";
const hardwareInfoVarName = "hardware-info";
const cpuUsageVarName = "cpu-usage";
const processesInfoVarName = "processes-info";
const memoryInfoVarName = "memory-info";
//supported pprofs: goroutine, threadcreate, heap, allocs, block, mutex
const goroutineProfileVarName = "pprof/goroutine";
const threadCreateProfileVarName = "pprof/threadcreate";
const heapProfileVarName = "pprof/heap";
const allocsProfileVarName = "pprof/allocs";
const blockProfileVarName = "pprof/block";
const mutexProfileVarName = "pprof/mutex";
const torrentStatsVarName = "torrent-stats";

export const getActiveSessionPin = (): string => {
	return store.getState().app.activeSessionPin;
};

export const sessionBaseUrl = (v2: boolean = false) => {
	const sessionId = getActiveSessionPin();
	let addr = store.getState().connection.backendAddress;

	let apiUrl = `${addr}/api`;
	if (v2) {
		apiUrl += "/v2";
	}

	return `${apiUrl}/${sessionVarName}/${sessionId}`;
};

export const currentNodeUrl = (v2: boolean = false) => {
	if (isLocalVersion()) {
		let addr = store.getState().connection.backendAddress;
		return `${addr}/debug/diag`;
	} else {
		const baseUrl = sessionBaseUrl(v2);
		const nodeId = store.getState().app.activeNodeId;
		return `${baseUrl}/${nodeVarName}/${nodeId}`;
	}
};

export const versionUrl = () => {
	const baseUrl = currentNodeUrl(true);
	return `${baseUrl}/${versionVarName}`;
};

export const flagsUrl = () => {
	const baseUrl = currentNodeUrl(true);
	return `${baseUrl}/${flagsVarName}`;
};

export const cmdLineUrl = () => {
	const baseUrl = currentNodeUrl(true);
	return `${baseUrl}/${cmdLineVarName}`;
};

export const logListUrl = (v2: boolean = false) => {
	const baseUrl = currentNodeUrl(v2);
	return `${baseUrl}/${logsVarName}`;
};

export const syncStagesUrl = () => {
	const baseUrl = currentNodeUrl();
	return `${baseUrl}/${syncStagesVarName}`;
};

export const dbListUrl = () => {
	const baseUrl = currentNodeUrl(true);
	return `${baseUrl}/${dbVarName}`;
};

export const dbUrl = (dbPath: string) => {
	const baseUrl = currentNodeUrl();
	return `${baseUrl}/${dbVarName}/${dbPath}/${tableVarName}`;
};

export const reorgUrl = () => {
	const baseUrl = currentNodeUrl();
	return `${baseUrl}/${reorgVarName}`;
};

export const peersUrl = () => {
	return `${currentNodeUrl(true)}/${peersVarName}`;
};

export const bootnodesUrl = () => {
	return `${currentNodeUrl(true)}/${bootnodeVarName}`;
};

export const snapshotSyncUrl = () => {
	return `${currentNodeUrl(true)}/${snapshotSyncVarName}`;
};

export const snapshotFilesListUrl = () => {
	return `${currentNodeUrl(true)}/${snapshotFilesListVarName}`;
};

export const headersUrl = () => {
	return `${currentNodeUrl(true)}/${headersVarName}`;
};

export const networkSpeedUrl = () => {
	return `${currentNodeUrl(true)}/${networkSpeedVarName}`;
};

export const nodeInfoUrl = () => {
	return `${currentNodeUrl(true)}/${nodeInfoVarName}`;
};

export const backendUrlUrl = () => {
	return `${window.location.origin}/diagaddr`;
};

export const hardwareInfoUrl = () => {
	return `${currentNodeUrl(true)}/${hardwareInfoVarName}`;
};

export const cpuUsageUrl = () => {
	return `${currentNodeUrl(true)}/${cpuUsageVarName}`;
};

export const processesInfoUrl = () => {
	return `${currentNodeUrl(true)}/${processesInfoVarName}`;
};

export const memoryInfoUrl = () => {
	return `${currentNodeUrl(true)}/${memoryInfoVarName}`;
};

export const goroutineProfileUrl = () => {
	return `${currentNodeUrl(true)}/${goroutineProfileVarName}`;
};

export const threadCreateProfileUrl = () => {
	return `${currentNodeUrl(true)}/${threadCreateProfileVarName}`;
};

export const heapProfileUrl = () => {
	return `${currentNodeUrl(true)}/${heapProfileVarName}`;
};

export const allocsProfileUrl = () => {
	return `${currentNodeUrl(true)}/${allocsProfileVarName}`;
};

export const blockProfileUrl = () => {
	return `${currentNodeUrl(true)}/${blockProfileVarName}`;
};

export const mutexProfileUrl = () => {
	return `${currentNodeUrl(true)}/${mutexProfileVarName}`;
};

export const torrentStatsUrl = () => {
	return `${currentNodeUrl(true)}/${torrentStatsVarName}`;
};

export const fetchBackendUrl = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve({
				address: "http://127.0.0.1:6060"
			});
		});
	} else {
		const request = createRequest(backendUrlUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchSession = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getSessionResponseJsonMock);
		});
	} else {
		const request = createRequest(sessionBaseUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchNodeInfo = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(nodeInfoMock);
		});
	} else {
		const request = createRequest(nodeInfoUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchVersion = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getVersionJsonMock);
		});
	} else {
		const request = createRequest(versionUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchFlags = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getFlagsResponseJsonMock);
		});
	} else {
		const request = createRequest(flagsUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchCmdLineArgs = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getCmdLineJsonMock);
		});
	} else {
		const request = createRequest(cmdLineUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchLogFilesList = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getLogsListJsonMock);
		});
	} else {
		const request = createRequest(logListUrl(true), "GET");
		return fetchRequest(request);
	}
};

//TODO: refactor function below to implement download file functionality (https://stackoverflow.com/a/50695407)
export const fetchLogFile = (logFileName: string) => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getCmdLineJsonMock);
		});
	} else {
		const url = logListUrl();
		const request = createRequest(`${url}/${logFileName}`, "GET");
		return fetchRequest(request);
	}
};

export const fetchSyncStages = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getSyncStagesResponseJsonMock);
		});
	} else {
		const request = createRequest(syncStagesUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchDBList = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getDBListJsonMock);
		});
	} else {
		const request = createRequest(dbListUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchDB = (dbPath: string) => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			if (dbPath === "txpool") {
				resolve(getDBTablesListJsonMock);
			} else {
				resolve([
					{
						name: "fdfdfdfdf",
						count: 1,
						size: 2330
					},
					{
						name: "dfdfn",
						count: 15,
						size: 6230
					}
				]);
			}
		});
	} else {
		const request = createRequest(dbUrl(dbPath), "GET");
		return fetchRequest(request);
	}
};

export const fetchReorgs = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getReorgsJsonMock);
		});
	} else {
		const request = createRequest(reorgUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchPeers = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		/*return new Promise((resolve, reject) => {
			resolve(getPeersJsonMock);
		});*/
		return new Promise((resolve, reject) => {
			let idx = store.getState().network.testPeersMsgIdx;
			let resp = getPeersData(idx);
			store.dispatch(setTestPeersMsgIdx(idx + 1));
			if (resp !== null) {
				resolve(resp);
			}
		});
	} else {
		const request = createRequest(peersUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchBootnodes = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getBootnodesJsonMock);
		});
	} else {
		const request = createRequest(bootnodesUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchSnapshotSync = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		//return new Promise((resolve, reject) => {
		//	resolve(syncStatsMock);
		//});
		return new Promise((resolve, reject) => {
			let idx = store.getState().syncStages.testSnpSyncMsgIdx;
			let resp = getSyncData(idx);
			store.dispatch(setTestSnpSyncMsgIdx(idx + 1));
			if (resp !== null) {
				resolve(resp);
			}
		});
	} else {
		const request = createRequest(snapshotSyncUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchSnapshotFilesList = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getSnapshotFilesListMock);
		});
	} else {
		const request = createRequest(snapshotFilesListUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchHeaders = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getHeadersMock);
		});
	} else {
		const request = createRequest(headersUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchNetworkSpeed = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(getNetworkSpeedMock);
		});
	} else {
		const request = createRequest(networkSpeedUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchHardwareInfo = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(hardwareInfoMock);
		});
	} else {
		const request = createRequest(hardwareInfoUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchCpuUsage = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(cpuUsageMock);
		});
	} else {
		const request = createRequest(cpuUsageUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchProcessesInfo = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(processesInfoMock);
			}, 4000);
		});
	} else {
		const request = createRequest(processesInfoUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchMemoryInfo = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(memoryInfoMock);
		});
	} else {
		const request = createRequest(memoryInfoUrl(), "GET");
		return fetchRequest(request);
	}
};

export const fetchTorrentStats = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve, reject) => {
			resolve(snpDLmock);
		});
	} else {
		const request = createRequest(torrentStatsUrl(), "GET");
		return fetchRequest(request);
	}
};

const fetchRequest = (request: Request) => {
	return fetch(request)
		.then((response) => {
			store.dispatch(setIsConnectedToNode(true));
			return response.json();
		})
		.catch((error) => {
			store.dispatch(setIsConnectedToNode(false));
			throw error;
		});
};

const createFormData = (jsonData: any) => {
	let formData = new FormData();
	for (const [key, value] of Object.entries(jsonData)) {
		formData.append(key, String(value));
	}
	return formData;
};

function createRequest(url: string, method: string, formData?: FormData) {
	return new Request(url, {
		method: method,
		headers: {
			"Content-Type": "application/json"
		}
	});
}
