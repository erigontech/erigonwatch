import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import PermDataSettingIcon from "@mui/icons-material/PermDataSetting";
import NetworkPingIcon from "@mui/icons-material/NetworkPing";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import DatasetIcon from "@mui/icons-material/Dataset";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useState } from "react";
import { Link } from "react-router-dom";
import SyncIcon from "@mui/icons-material/Sync";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { useSelector } from "react-redux";
import { selectIssuesCountForBadge } from "../../store/issuesSlice";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import MemoryIcon from "@mui/icons-material/Memory";
import InfoIcon from "@mui/icons-material/Info";
import ListAltIcon from "@mui/icons-material/ListAlt";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";

export const SidebarComponent = () => {
	const [isColapsed, setIsColapsed] = useState(false);
	const issuesCount = useSelector(selectIssuesCountForBadge);

	return (
		<Sidebar
			collapsed={isColapsed}
			style={{
				height: "100vh",
				backgroundColor: "#fff"
			}}
		>
			<Menu
				menuItemStyles={{
					button: {
						color: "#2e67eb",
						[`&:hover`]: {
							backgroundColor: "#2e67eb",
							color: "#fff"
						}
					}
				}}
			>
				<MenuItem
					icon={<MenuOutlinedIcon />}
					onClick={() => {
						setIsColapsed(!isColapsed);
					}}
				/>
				<MenuItem
					component={<Link to="/" />}
					icon={<PermDataSettingIcon />}
				>
					Process
				</MenuItem>
				<SubMenu
					label="Network"
					icon={<NetworkPingIcon />}
				>
					<MenuItem
						component={<Link to="/sentry-network" />}
						icon={<PeopleOutlineIcon />}
					>
						eth/6x P2P
					</MenuItem>

					<MenuItem
						component={<Link to="/sentinel-network" />}
						icon={<PeopleOutlineIcon />}
					>
						Beacon chain P2P
					</MenuItem>

					<MenuItem
						component={<Link to="/downloader" />}
						icon={<SyncIcon />}
					>
						Downloader
					</MenuItem>
				</SubMenu>
				<MenuItem
					component={<Link to="/logs" />}
					icon={<StickyNote2Icon />}
				>
					Logs
				</MenuItem>
				{/*<MenuItem
					component={<Link to="/chain" />}
					icon={<LinkIcon />}
				>
					Chain
				</MenuItem>*/}
				<MenuItem
					component={<Link to="/data" />}
					icon={<DatasetIcon />}
				>
					Data
				</MenuItem>
				{/*<MenuItem
					component={<Link to="/debug" />}
					icon={<PestControlIcon />}
				>
					Debug
				</MenuItem>
				<MenuItem
					component={<Link to="/testing" />}
					icon={<BiotechIcon />}
				>
					Testing
				</MenuItem>
				<MenuItem
					component={<Link to="/performance" />}
					icon={<SpeedIcon />}
				>
					Performance
				</MenuItem>
				<MenuItem
					component={<Link to="/documentation" />}
					icon={<SummarizeIcon />}
				>
					Documentation
				</MenuItem>
				<MenuItem
					component={<Link to="/issues" />}
					icon={<WarningIcon />}
					suffix={
						<>
							{issuesCount === "0" ? null : (
								<div className="w-5 flex items-center justify-center rounded-full aspect-square bg-red-500 text-white text-xs font-semibold">
									{issuesCount}
								</div>
							)}
						</>
					}
				>
					Issues
				</MenuItem>*/}
				<SubMenu
					label="System Info"
					icon={<DesktopWindowsIcon />}
				>
					<MenuItem
						component={<Link to="/sysinfo" />}
						icon={<InfoIcon />}
					>
						Info
					</MenuItem>

					<MenuItem
						component={<Link to="/cpu-info" />}
						icon={<MemoryIcon />}
					>
						CPU
					</MenuItem>

					<MenuItem
						component={<Link to="/processes" />}
						icon={<ListAltIcon />}
					>
						Processes
					</MenuItem>
					<MenuItem
						component={<Link to="/profile" />}
						icon={<NetworkCheckIcon />}
					>
						Profile
					</MenuItem>
				</SubMenu>
				<MenuItem
					component={<Link to="/admin" />}
					icon={<AdminPanelSettingsIcon />}
				>
					Admin
				</MenuItem>
			</Menu>
		</Sidebar>
	);
};
