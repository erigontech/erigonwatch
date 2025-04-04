import { useRef, useState } from "react";
import { Flag, NodeInfo } from "../../../entities";
import { KeyValue, Reorg } from "../../store/appSlice";
import { DetailsButton } from "./detailsButton";
import { CommandLineArgsSection } from "./CommandLineArgsSection/commandLineArgsSection";
import { FlagsSection } from "./FlagsSection/flagsSection";
import { NodeInfoSection } from "./NodeInfoSection/nodeInfoSection";
import { SyncStagesSection } from "./SyncStagesSection/syncStagesSection";
import { ReorgsSection } from "./ReorgsSection/reorgsSection";
import { BUTTON_BULE } from "../../../helpers/colors";
import { Button } from "../Button/Button";
import { cmdLineUrl, flagsUrl, reorgUrl, sessionBaseUrl, syncStagesUrl } from "../../../Network/APIHandler";
import { NodeInfoValuePopupProps } from "../Popup/NodeInfoPopup";
import { NodeInfoPopup } from "../Popup/NodeInfoPopup";

export enum Tab {
	Command = "Command",
	Flags = "Flags",
	NodeInfo = "Node Info",
	SyncStages = "Stages",
	Reorgs = "Reorgs"
}
interface DetailsSectionProps {
	nodeDetails?: NodeInfo;
	syncStages?: KeyValue[];
	reorgs?: Reorg;
}

export const DetailsSection = ({ nodeDetails, syncStages, reorgs }: DetailsSectionProps) => {
	const [selectedTab, setSelectedTab] = useState(Tab.Command);
	const [isCopied, setIsCopied] = useState(false);
	const [popupProps, setPopupProps] = useState<NodeInfoValuePopupProps | null>(null);

	const divRef = useRef(null);

	async function copyTextToClipboard(text: string) {
		if ("clipboard" in navigator) {
			return await navigator.clipboard.writeText(text);
		} else {
			return document.execCommand("copy", true, text);
		}
	}

	const getCurl = () => {
		let copyText = "";
		switch (selectedTab) {
			case Tab.Command:
				copyText = cmdLineUrl();
				break;
			case Tab.Flags:
				copyText = flagsUrl();
				break;
			case Tab.NodeInfo:
				copyText = sessionBaseUrl();
				break;
			case Tab.SyncStages:
				copyText = syncStagesUrl();
				break;
			case Tab.Reorgs:
				copyText = reorgUrl();
				break;
		}
		return copyText;
	};

	const handleCopyClick = () => {
		const copyText = getCurl();

		copyTextToClipboard(copyText)
			.then(() => {
				setIsCopied(true);
				setTimeout(() => {
					setIsCopied(false);
				}, 1500);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const selectTab = (tab: Tab) => {
		setSelectedTab(tab);
		scrollToTop();
	};

	const scrollToTop = () => {
		if (divRef.current) {
			(divRef.current as HTMLDivElement).scroll({
				top: 0,
				behavior: "smooth"
			});
		}
	};

	return (
		<div className="flex flex-row">
			<div className="flex flex-col max-h-[90vh] items-center justify-center w-full">
				<div className="flex flex-row">
					<DetailsButton
						tab={Tab.Command}
						selectedTab={selectedTab}
						testId="command_button"
						onButtonClicked={(tab) => {
							selectTab(tab);
						}}
					/>
					<DetailsButton
						tab={Tab.Flags}
						selectedTab={selectedTab}
						testId="flags_button"
						onButtonClicked={(tab) => {
							selectTab(tab);
						}}
					/>
					<DetailsButton
						tab={Tab.NodeInfo}
						selectedTab={selectedTab}
						testId="node_info_button"
						onButtonClicked={(tab) => {
							selectTab(tab);
						}}
					/>
					{/*<DetailsButton
						tab={Tab.SyncStages}
						selectedTab={selectedTab}
						testId="sync_stages_button"
						onButtonClicked={(tab) => {
							selectTab(tab);
						}}
					/>
					<DetailsButton
						tab={Tab.Reorgs}
						selectedTab={selectedTab}
						testId="reorgs_button"
						onButtonClicked={(tab) => {
							selectTab(tab);
						}}
					/>*/}
					<div className="w-5" />
					<Button
						backgroundColor={BUTTON_BULE}
						label={!isCopied ? "Copy curl" : "Copied"}
						onClick={() => handleCopyClick()}
						primary
					/>
				</div>
				<div className="h-10" />
				<div
					className="flex flex-col shadow-lg rounded-md p-2 bg-white min-h-[40px] max-w-[1400px] min-w-[30vw] overflow-auto"
					data-testid="test_details_section_content"
					ref={divRef}
				>
					{selectedTab === Tab.Command && <CommandLineArgsSection />}
					{selectedTab === Tab.Flags && <FlagsSection />}
					{selectedTab === Tab.NodeInfo && (
						<NodeInfoSection
							nodeDetails={nodeDetails}
							onShowNodeValueDetails={(key: string, value: string) => {
								setPopupProps({ key, value });
							}}
						/>
					)}
					{selectedTab === Tab.SyncStages && <SyncStagesSection syncStages={syncStages} />}
					{selectedTab === Tab.Reorgs && <ReorgsSection reorg={reorgs} />}
				</div>
			</div>

			{popupProps && (
				<NodeInfoPopup
					value={popupProps}
					onClose={() => setPopupProps(null)}
				/>
			)}
		</div>
	);
};
