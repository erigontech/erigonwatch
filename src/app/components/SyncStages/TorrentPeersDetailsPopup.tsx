import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { SegmentPeerDiagData, selectSegmentPeersDiagDataForNode, selectTorrrentPeersForNode } from "../../store/syncStagesSlice";
import CloseIcon from "@mui/icons-material/Close";
import { TorrentPeersTable } from "./TorrentPeersTable";
import { TorrentPeersHistory } from "./TorrentPeerHistory";
import { PeerIdToString } from "../../../helpers/converters";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface TorrentPeersDetailsPopupProps {
	onClose: () => void;
}

export const TorrentPeersDetailsPopup = ({ onClose }: TorrentPeersDetailsPopupProps) => {
	const peers = useSelector(selectTorrrentPeersForNode);
	const perrsdiagData = useSelector(selectSegmentPeersDiagDataForNode);

	const [selectedPeer, setSelectedPeer] = useState<SegmentPeerDiagData | undefined>(undefined);

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			console.log("selectedPeer", selectedPeer);

			if (selectedPeer !== undefined) {
				console.log("setSelectedPeer");
				setSelectedPeer(undefined);
			} else {
				onClose();
			}
		}
	};

	const findPeerById = (peerId: string): SegmentPeerDiagData | undefined => {
		return perrsdiagData.find((peer) => {
			return peer.peerId === peerId;
		});
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);

		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, []);

	useEffect(() => {
		console.log("peers changed");
		selectedPeer && setSelectedPeer(findPeerById(selectedPeer.peerId));
	}, [peers]);

	const convertPid = (pid: string): string => {
		let arr = pid.split(",");
		let nums = arr.map((num) => parseInt(num));

		let res = PeerIdToString(nums);
		return res;
	};

	const renderHeader = () => {
		return (
			<div className="flex flex-row w-full pt-10 pr-10 pl-10">
				<div className="flex-[1]">
					{selectedPeer && (
						<ArrowBackIcon
							onClick={() => {
								console.log("setSelectedPeer 1");
								setSelectedPeer(undefined);
							}}
							className="cursor-pointer"
						/>
					)}
				</div>
				<div className="flex flex-[2] justify-center">
					<h3 className="text-3xl font-semibold">{selectedPeer ? convertPid(selectedPeer.peerId) : "Peers list"}</h3>
				</div>
				<div className="flex flex-[1] justify-end">
					<CloseIcon
						onClick={() => onClose()}
						className="cursor-pointer"
					/>
				</div>
			</div>
		);
	};

	return (
		<>
			<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto inset-0 z-50 outline-none focus:outline-none absolute bg-black/[.4]">
				<div className="relative w-auto my-6 mx-auto max-w-[100vw]">
					{/*content*/}
					<div className="border-0 rounded-lg shadow-lg relative flex flex-col w-fit bg-white outline-none focus:outline-none items-center">
						{/*header*/}
						{renderHeader()}
						{/*body*/}
						<div className="flex flex-col relative p-6 flex-auto justify-start items-center h-[75vh] overflow-scroll">
							{selectedPeer ? (
								<TorrentPeersHistory peer={selectedPeer} />
							) : (
								<TorrentPeersTable
									peers={peers}
									peerSelected={false}
									onPeerClicked={(peer) => {
										let res = findPeerById(peer.peerId.toString());
										console.log("res", res);
										setSelectedPeer(res);
									}}
								/>
							)}
						</div>
						{/*footer*/}
					</div>
				</div>
			</div>
			<div className="opacity-25 inset-0 z-40 bg-black"></div>
		</>
	);
};
