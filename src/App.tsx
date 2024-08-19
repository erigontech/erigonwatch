import { Routes, Route, Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProcessPage } from "./app/pages/ProcessPage";
import { LogsPage } from "./app/pages/LogsPage";
import { useDispatch, useSelector } from "react-redux";
import {
	addOrUpdateSession,
	resetAppStateToMockState,
	selectActiveNodeId,
	selectActiveSession,
	selectActiveSessionPin,
	selectDBsForNode
} from "./app/store/appSlice";
import {
	getBackendUrl,
	getBootnodes,
	getDB,
	getDBsList,
	getHardwareInfo,
	getHeaders,
	getLogs,
	getNodeCmdLineArgs,
	getNodeFlags,
	getNodeInfo,
	getNodeVersion,
	getPeers,
	getReorgs,
	getSession,
	getSnapshotDownloadStatus,
	getSnapshotFilesList,
	getSyncStages
} from "./Network/APIGateway";
import { DataPage } from "./app/pages/DataPage";
import { AdminPage } from "./app/pages/AdminPage";
import { StatusBar } from "./app/components/statusBar";
import { SessionsModal } from "./app/components/SessionsModal";
import { NodesModal } from "./app/components/nodesModal";
import { SidebarComponent } from "./app/components/SidebarComponent/SidebarComponent";
import { resetNetworkStateToMockState, updatePeersState } from "./app/store/networkSlice";
import { NetworkDownloaderPage } from "./app/pages/NetworkDownloaderPage";
import { Time } from "./helpers/time";
import { PeerNetworkPage } from "./app/pages/PeerNetworkPage";
import { PerformancePage } from "./app/pages/PerformancePage";
//import raw from "./erigon.txt";
//import statsjson from "./syncStats.json";
import { resetSyncStagesState, selectShouldFetchSnapshotFilesListForActiveNode } from "./app/store/syncStagesSlice";
import { IssuesPage } from "./app/pages/IssuesPage";
import { resetIssueState } from "./app/store/issuesSlice";
import { isLocalVersion } from "./helpers/env";
import { NodeConnectionType, selectNodeConnectionType } from "./app/store/connectionSlice";
import { SystemInfoPage } from "./app/pages/SystemInfoPage";
import { resetSystemInfoState } from "./app/store/systemInfoSlice";
import { SystemProcessesPage } from "./app/pages/SystemProcessesPage";
import { SystemCPUUsage } from "./app/pages/SystemCPUUsage";
import { ProfilePage } from "./app/pages/ProfilePage";

function App() {
	return (
		<div>
			{/* Routes nest inside one another. Nested route paths build upon
            parent route paths, and nested route elements render inside
            parent route elements. See the note about <Outlet> below. */}
			<Routes>
				<Route
					path="/"
					element={<Layout />}
				>
					<Route
						index
						element={<ProcessPage />}
					/>
					<Route
						path="sentry-network"
						element={<PeerNetworkPage type="sentry" />}
					/>
					<Route
						path="sentinel-network"
						element={<PeerNetworkPage type="sentinel" />}
					/>
					<Route
						path="downloader"
						element={<NetworkDownloaderPage />}
					/>
					<Route
						path="logs"
						element={<LogsPage />}
					/>
					<Route
						path="chain"
						element={<Chain />}
					/>
					<Route
						path="data"
						element={<DataPage />}
					/>
					<Route
						path="debug"
						element={<Debug />}
					/>
					<Route
						path="testing"
						element={<Testing />}
					/>
					<Route
						path="performance"
						element={<PerformancePage />}
					/>
					<Route
						path="documentation"
						element={<Documentation />}
					/>
					<Route
						path="issues"
						element={<IssuesPage />}
					/>
					<Route
						path="sysinfo"
						element={<SystemInfoPage />}
					/>
					<Route
						path="processes"
						element={<SystemProcessesPage />}
					/>
					<Route
						path="cpu-info"
						element={<SystemCPUUsage />}
					/>
					<Route
						path="profile"
						element={<ProfilePage />}
					/>
					<Route
						path="admin"
						element={<AdminPage />}
					/>

					{/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
					<Route
						path="*"
						element={<NoMatch />}
					/>
				</Route>
			</Routes>
		</div>
	);
}

function Layout() {
	const dispatch = useDispatch();
	const activeNodeId = useSelector(selectActiveNodeId);
	const dbs = useSelector(selectDBsForNode);
	const activeSessionPin = useSelector(selectActiveSessionPin);
	const activeSession = useSelector(selectActiveSession);
	const shouldFetchFilesList = useSelector(selectShouldFetchSnapshotFilesListForActiveNode);
	const conectionType = useSelector(selectNodeConnectionType);

	const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
	const [isNodesModalOpen, setIsNodesModalOpen] = useState(false);

	useEffect(() => {
		if (activeSession && document?.title) {
			document.title = "ErigonWatch - " + activeSession.name;
		}
	}, [activeSession]);

	useEffect(() => {
		getBackendUrl();
	}, []);

	/*useEffect(() => {
		fetch(raw)
			.then((r) => r.text())
			.then((text) => {
				let arr = stringToArrayBySeparator(text, "\n");
				let bbbb = filterStringsByPrefix(arr, "SyncStatistics");
				let arrdddd: any[] = [];
				bbbb.forEach((str) => {
					let str2 = getStringByKeyFromString(str, "stats=");
					let obj = JSON.parse(str2);
					let obj2 = JSON.parse(obj);
					arrdddd.push(obj2);
					console.log(obj2);
				});
				saveObjectToFile(arrdddd, "syncStats");
			});
	}, []);

	function saveObjectToFile(obj: any, filename: string) {
		let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
		let downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", filename + ".json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	function getStringByKeyFromString(str: string, key: string): string {
		let result = "";
		if (str.includes(key)) {
			let arr = str.split(key);
			result = arr[1];
		}
		return result;
	}

	function stringToArrayBySeparator(str: string, separator: string): string[] {
		return str.split(separator);
	}

	function filterStringsByPrefix(arr: string[], prefix: string): string[] {
		return arr.filter((str) => str.includes(prefix));
	}*/

	useEffect(() => {
		if (import.meta.env.VITE_SERVER_RESPONSE_TYPE === "MOCK") {
			dispatch(resetAppStateToMockState());
			dispatch(resetNetworkStateToMockState());
			dispatch(resetSyncStagesState());
			dispatch(resetIssueState());
			dispatch(resetSystemInfoState());
		}
	}, []);

	useEffect(() => {
		if (conectionType !== NodeConnectionType.Unknown) {
			if (isLocalVersion()) {
				dispatch(addOrUpdateSession({ name: "localSession", pin: "noPin", is_active: true, nodes: [] }));
			}
		}
	}, [conectionType]);

	useEffect(() => {
		if (conectionType !== NodeConnectionType.Unknown) {
			if (isLocalVersion()) {
				getNodeInfo();
			} else {
				if (activeSessionPin !== "") {
					getSession();
				}
			}
		}
	}, [activeSessionPin, conectionType]);

	useEffect(() => {
		if (activeNodeId !== "" && activeSessionPin !== "") {
			queryData();
		}
	}, [activeNodeId]);

	const queryData = () => {
		getHardwareInfo();
		getNodeCmdLineArgs();
		getNodeFlags();
		getNodeVersion();
		getLogs();
		getSyncStages();
		getDBsList();
		getReorgs();
		getPeers();
		setInterval(() => {
			getPeers();
		}, 5 * Time.second);
		getBootnodes();
		getSnapshotDownloadStatus();
		setInterval(() => {
			getSnapshotDownloadStatus();
		}, 20 * Time.second);

		setInterval(() => {
			//checkForNoPeersForSnapshotSegment();
			//getNetworkSpeed();
			//checkForNetworkSpeedIssue();
		}, 2 * Time.second);

		setInterval(() => {
			dispatch(updatePeersState({ activeNodeId: activeNodeId, countInterval: 15 }));
		}, 15 * Time.second);

		getHeaders();
	};

	let intervalID: any = null;
	useEffect(() => {
		if (shouldFetchFilesList) {
			intervalID = setInterval(() => {
				getSnapshotFilesList();
			}, 5 * Time.second);
		} else {
			clearInterval(intervalID);
		}

		return () => clearInterval(intervalID);
	}, [shouldFetchFilesList]);

	useEffect(() => {
		if (activeNodeId !== "" && dbs.length > 0) {
			dbs.forEach((db) => {
				if (db.tables.length === 0) {
					getDB(db.path);
				}
			});
		}
	}, [dbs]);

	return (
		<div className="flex overflow-clip">
			{/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
			<SidebarComponent />

			<div className="flex flex-col w-full p-4 h-full overflow-scroll">
				<Outlet />
			</div>

			<StatusBar
				onSessionClicked={() => {
					setIsSessionsModalOpen(true);
				}}
				onNodeClicked={() => {
					setIsNodesModalOpen(true);
				}}
			/>

			<SessionsModal
				open={isSessionsModalOpen}
				onClose={() => {
					setIsSessionsModalOpen(false);
				}}
			/>
			<NodesModal
				open={isNodesModalOpen}
				onClose={() => {
					setIsNodesModalOpen(false);
				}}
			/>

			{/*<InfoBanner />*/}

			{/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
		</div>
	);
}

function Chain() {
	return (
		<div>
			<h2>Chain</h2>
		</div>
	);
}

function Debug() {
	return (
		<div>
			<h2>Debug</h2>
		</div>
	);
}

function Testing() {
	return (
		<div>
			<h2>Testing</h2>
		</div>
	);
}

function Performance() {
	return (
		<div>
			<h2>Performance</h2>
		</div>
	);
}

function Documentation() {
	return (
		<div>
			<h2>Documentation</h2>
		</div>
	);
}

function NoMatch() {
	return (
		<div>
			<h2>Nothing to see here!</h2>
			<p>
				<Link to="/">Go to the home page</Link>
			</p>
		</div>
	);
}

export default App;
