import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, CircularProgress } from "@mui/material";
import {
	allocsProfileUrl,
	blockProfileUrl,
	goroutineProfileUrl,
	heapProfileUrl,
	mutexProfileUrl,
	threadCreateProfileUrl
} from "../../Network/APIHandler";
import { Graphviz } from "graphviz-react";
import { addProfile, selectAllProfileDataForNode } from "../store/profileSlice";
import { selectActiveNodeId } from "../store/appSlice";
import CheckIcon from "@mui/icons-material/Check";

export interface ProfilePageProps {
	profile: string;
}

export const ProfilePage = ({ profile }: ProfilePageProps) => {
	const dispatch = useDispatch();

	const [imagesMap, setImagesMap] = useState<Map<string, string>>(new Map());
	const [loading, setLoading] = useState<boolean>(false);
	const activeNodeId = useSelector(selectActiveNodeId);
	const profileData = useSelector(selectAllProfileDataForNode);
	const [selectedProfileIndex, setSelectedProfileIndex] = useState<number>(-1);
	const [selectedProfile, setSelectedProfile] = useState<string>("");

	const getFunction = async () => {
		try {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", getFetchUrl(), true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4 && xhr.status === 200) {
					setLoading(false);
					imagesMap.set(profile, xhr.responseText);

					dispatch(addProfile({ nodeId: activeNodeId, profileName: profile, data: xhr.responseText }));
				}
			};
			xhr.send();
		} catch (error) {
			setLoading(false);
			console.error(error);
		}
	};

	useEffect(() => {
		setSelectedProfileIndex(-1);
		setSelectedProfile("");
	}, [profile]);

	const getFetchUrl = () => {
		switch (profile) {
			case "heap":
				return heapProfileUrl();
			case "goroutine":
				return goroutineProfileUrl();
			case "threadcreate":
				return threadCreateProfileUrl();
			case "block":
				return blockProfileUrl();
			case "mutex":
				return mutexProfileUrl();
			case "allocs":
				return allocsProfileUrl();
			default:
				return heapProfileUrl();
		}
	};

	const capitalizeFirstLetter = (str: string): string => {
		if (str.length === 0) {
			return str;
		}
		return str[0].toUpperCase() + str.slice(1);
	};

	const decodeBase64 = (base64: string): string => {
		return atob(base64);
	};

	const graphHeight = window.innerHeight * 0.8;
	const graphWidth = window.innerWidth * 0.8;

	const profileDataForProfile = profileData.find((pdata) => pdata.name === profile);

	const renderHistory = () => {
		return (
			<div>
				<table className="table-auto bg-white text-left w-full">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="py-2 px-4">Profile snapshot</th>
							<th className="py-2 px-2 w-8"></th>
						</tr>
					</thead>
					<tbody>
						{profileDataForProfile?.profile.map((data, index) => {
							const isSelected = selectedProfileIndex === index;
							return (
								<tr
									key={index}
									className={`border-b border-gray-200 cursor-pointer ${isSelected ? "bg-blue-50" : ""}`}
									onClick={() => {
										selectProfile(index);
									}}
								>
									<td className="py-2 px-4">{data.date}</td>
									<td className="py-2 px-2 text-center">
										{isSelected && (
											<CheckIcon
												color="primary"
												fontSize="small"
											/>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	};

	const selectProfile = (idx: number) => {
		if (!profileDataForProfile || profileDataForProfile.profile.length === 0) {
			setSelectedProfileIndex(-1);
			setSelectedProfile("");
			return;
		}
		setSelectedProfileIndex(idx);
		setSelectedProfile(profileDataForProfile.profile[idx]?.data || "");
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-center">
				<h3 className="text-xl font-semibold">{capitalizeFirstLetter(profile) + " Profile"}</h3>
			</div>
			<div className="flex flex-row justify-between">
				<div className="w-[15%]">
					{renderHistory()}
					{loading ? (
						<CircularProgress />
					) : (
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								setLoading(true);
								getFunction();
							}}
						>
							Fetch Data
						</Button>
					)}
				</div>
				<div className="mt-5 mr-5 mb-5">
					{selectedProfile != "" && (
						<Graphviz
							dot={decodeBase64(selectedProfile)}
							options={{ fit: true, zoom: true, height: graphHeight, width: graphWidth }}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
