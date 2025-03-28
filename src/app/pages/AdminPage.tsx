import { useDispatch, useSelector } from "react-redux";
import { addOrUpdateSession, resetAppStateToMockState } from "../store/appSlice";
import { useState } from "react";
import { CreateSessionPopup } from "../components/createSessionPopup";
import { SessionsList } from "../components/sessionsList";
import { Button } from "../components/Button/Button";
import { BUTTON_BULE, BUTTON_RED } from "../../helpers/colors";
import { resetNetworkStateToMockState } from "../store/networkSlice";
import { Popup } from "../components/Popup/Popup";
import { NodeConnectionType, resetConectionState, selectNodeConnectionType } from "../store/connectionSlice";

export const AdminPage = () => {
	const dispatch = useDispatch();
	const [showCreateSessionPopup, setShowCreateSessionPopup] = useState(false);
	const [showClearDataPopup, setShowClearDataPopup] = useState(false);
	const conectionType = useSelector(selectNodeConnectionType);

	function randomNumber(min: number, max: number) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	return (
		<div className="flex flex-col">
			<h3 className="py-2 text-xl font-semibold">Sessions List</h3>
			<SessionsList onSessionSelected={() => {}} />
			<div className="absolute right-[5vw] bottom-[10vh]">
				<Button
					backgroundColor={BUTTON_RED}
					label="Clear all data"
					onClick={() => {
						setShowClearDataPopup(true);
					}}
					primary
				/>
			</div>
			{showCreateSessionPopup ? (
				<CreateSessionPopup
					onClose={() => setShowCreateSessionPopup(false)}
					onCreate={(sessionName) => {
						let pin = randomNumber(10000000, 99999999).toString();
						dispatch(addOrUpdateSession({ name: sessionName, pin: pin, is_active: true, nodes: [] }));
						setShowCreateSessionPopup(false);
					}}
				/>
			) : (
				<Button
					backgroundColor={BUTTON_BULE}
					label="Create Session"
					onClick={() => setShowCreateSessionPopup(true)}
					primary
					disabled={conectionType != NodeConnectionType.Remote}
				/>
			)}
			{showClearDataPopup && (
				<Popup
					title="Clear all data"
					body="Are you sure you want to clear all data?"
					positiveButton="Clear"
					negativeButton="Cancel"
					onPositiveClick={() => {
						dispatch(resetAppStateToMockState());
						dispatch(resetNetworkStateToMockState());
						dispatch(resetConectionState());
						setShowClearDataPopup(false);
					}}
					onNegativeClick={() => setShowClearDataPopup(false)}
					onClose={() => setShowClearDataPopup(false)}
				/>
			)}
		</div>
	);
};
