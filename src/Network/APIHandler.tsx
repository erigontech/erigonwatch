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
	getPeersJsonMock,
	getHeadersMock,
	getNetworkSpeedMock,
	nodeInfoMock,
	syncStatsMock
} from "./../../tests/mocks";

const sessionVarName = "sessions";
const nodeVarName = "nodes";
const versionVarName = "versions";
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
	const baseUrl = currentNodeUrl();
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

export const fetchBackendUrl = () => {
	if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
		return new Promise((resolve) => {
			resolve({
				address: "http://127.0.0.1:6060"
			});
		});
	} else {
		const host = window.location.host;
		const request = createRequest(backendUrlUrl(), "GET");

		return fetchRequest(request)
			.then((response) => {
				if (response.address) {
					let address = response.address;
					let isDefault = false;

					if (address.startsWith("http")) {
						address = address.substring(address.indexOf("//") + 2);
						address = address.indexOf("/") >=0 ? address.substring(0, address.indexOf("/")) : address;
					}

					if (address === "127.0.0.1:6060" || address === "localhost:6060") isDefault = true;
					if (isDefault) {
						const hostWithoutPort = host.substring(0, host.lastIndexOf(":"));
						const _address = window.location.protocol + "//" + hostWithoutPort + ":6060";

						return new Promise((resolve) => {
							resolve({
								address: _address,
							});
						});
					}

					return new Promise((resolve) => {
						resolve({
							address: response.address,
						});
					});
				}
			})
			.catch(() => {
				return new Promise((_, reject) => {
					reject();
				});
			});
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
		return new Promise((resolve, reject) => {
			resolve(getPeersJsonMock);
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
		return new Promise((resolve, reject) => {
			resolve(syncStatsMock);
		});
		/*return new Promise((resolve, reject) => {
			let idx = store.getState().syncStages.testSnpSyncMsgIdx;
			let resp = getSyncData(idx);
			store.dispatch(setTestSnpSyncMsgIdx(idx + 1));
			if (resp !== null) {
				resolve(resp);
			}
		});*/
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
			"Diagnostics-API-Key": "your-api-key",
			"Content-Type": "application/json"
		}
	});
}
