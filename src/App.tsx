import { Routes, Route, Outlet, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
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
	getNodeInfo,
	getNodeVersion,
	getPeers,
	getReorgs,
	getSession,
	getSnapshotDownloadStatus,
	getSyncStages
} from "./Network/APIGateway";
import { DataPage } from "./app/pages/DataPage";
import { AdminPage } from "./app/pages/AdminPage";
import { StatusBar } from "./app/components/statusBar";
import { SessionsModal } from "./app/components/SessionsModal";
import { NodesModal } from "./app/components/nodesModal";
import { SidebarComponent } from "./app/components/SidebarComponent/SidebarComponent";
import { resetNetworkStateToMockState } from "./app/store/networkSlice";
import { NetworkDownloaderPage } from "./app/pages/NetworkDownloaderPage";
import { Time } from "./helpers/time";
import { PeerNetworkPage } from "./app/pages/PeerNetworkPage";
import { PerformancePage } from "./app/pages/PerformancePage";
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
import NewTxPoolDashboard from "./app/pages/NewTxPoolDashboard";
import { WebSocketClient } from "./Network/WebsocketClient";

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
						path="goroutine"
						element={<ProfilePage profile="goroutine" />}
					/>
					<Route
						path="threadcreate"
						element={<ProfilePage profile="threadcreate" />}
					/>
					<Route
						path="heap"
						element={<ProfilePage profile="heap" />}
					/>
					<Route
						path="allocs"
						element={<ProfilePage profile="allocs" />}
					/>
					<Route
						path="block"
						element={<ProfilePage profile="block" />}
					/>
					<Route
						path="mutex"
						element={<ProfilePage profile="mutex" />}
					/>
					<Route
						path="txpool"
						element={<NewTxPoolDashboard />}
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

	//init websocket connection
	WebSocketClient.getInstance();

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
		if (activeSession && document?.title) {
			document.title = "ErigonWatch - " + activeSession.name;
		}
	}, [activeSession]);

	useEffect(() => {
		getBackendUrl();
	}, []);

	useEffect(() => {
		if (conectionType !== NodeConnectionType.Unknown) {
			if (isLocalVersion()) {
				getNodeInfo();
			} else {
				if (activeSessionPin !== "") {
					getSession();
				}
			}
		} else {
			if (isLocalVersion()) {
				dispatch(addOrUpdateSession({ name: "localSession", pin: "noPin", is_active: true, nodes: [] }));
			}
		}
	}, [conectionType, activeSessionPin]);

	useEffect(() => {
		if (isLocalVersion()) {
			dispatch(addOrUpdateSession({ name: "localSession", pin: "noPin", is_active: true, nodes: [] }));
		}
	}, [conectionType]);

	const isInitialMount = useRef(true);

	useEffect(() => {
		if (activeNodeId !== "" && activeSessionPin !== "") {
			if (isInitialMount.current) {
				isInitialMount.current = false;
				queryData();
			}
		}
	}, [activeNodeId]);

	const queryData = () => {
		getHardwareInfo();
		getNodeVersion();
		getLogs();
		getSyncStages();
		getDBsList();
		getReorgs();
		setInterval(() => {
			getPeers();
		}, 20 * Time.second);
		getBootnodes();
		getSnapshotDownloadStatus();
		setInterval(() => {
			getSnapshotDownloadStatus();
		}, 20 * Time.second);

		/*setInterval(() => {
			checkForNoPeersForSnapshotSegment();
			getNetworkSpeed();
			checkForNetworkSpeedIssue();
		}, 2 * Time.second);*/

		getHeaders();
	};

	let intervalID: any = null;
	useEffect(() => {
		if (shouldFetchFilesList) {
			intervalID = setInterval(() => {
				//getSnapshotFilesList();
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
