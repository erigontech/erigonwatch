import { useSelector } from "react-redux";
import { useEffect } from "react";
import { selectTorrrentPeersForNode } from "../../store/syncStagesSlice";
import CloseIcon from "@mui/icons-material/Close";
import { TorrentPeersTable } from "./TorrentPeersTable";

interface TorrentPeersDetailsPopupProps {
	onClose: () => void;
}

export const TorrentPeersDetailsPopup = ({ onClose }: TorrentPeersDetailsPopupProps) => {
	const peers = useSelector(selectTorrrentPeersForNode);

	const handleKeyPress = (event: KeyboardEvent) => {
		if (event.key === "Escape") {
			onClose();
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);

		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, []);

	const renderHeader = () => {
		return (
			<div className="flex flex-row w-full pt-10 pr-10 pl-10">
				<div className="flex-[1]"></div>
				<div className="flex flex-[2] justify-center">
					<h3 className="text-3xl font-semibold">Peers list</h3>
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

	const bytesToString = (bts: number[]): string => {
		//let s = bytes.map((byte) => String.fromCharCode(byte)).join("");
		const bytes = new Uint8Array(bts);
		let res = toString(bytes);
		return res;
	};

	function toString(id: Uint8Array): string {
		// Equivalent of the Go code checking `me[0] == '-' && me[7] == '-'`
		if (id[0] === 45 && id[7] === 45) {
			// 45 is the ASCII code for '-'
			//return byteArrayToString(id.slice(0, 8)) + byteArrayToHex(id.slice(8));
			return byteArrayToHex(id.slice(8));
		}

		// Hex encoding of the entire array if no condition is met
		return byteArrayToHex(id);
	}

	// Helper function to convert byte array to string
	function byteArrayToString(bytes: Uint8Array): string {
		return new TextDecoder().decode(bytes);
	}

	// Helper function to convert byte array to hex string
	function byteArrayToHex(bytes: Uint8Array): string {
		return Array.from(bytes)
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

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
							<TorrentPeersTable
								peers={peers}
								peerSelected={false}
								onPeerClicked={() => {}}
							/>
						</div>
						{/*footer*/}
					</div>
				</div>
			</div>
			<div className="opacity-25 inset-0 z-40 bg-black"></div>
		</>
	);
};
