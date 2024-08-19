import { useDispatch, useSelector } from "react-redux";
import { selectSessionsForList, setActiveSessionPin } from "../store/appSlice";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
import { InfoAlert } from "./Alerts/InfoAlert";

interface SessionsListProps {
	onSessionSelected: () => void;
}

export const SessionsList = ({ onSessionSelected, ...props }: SessionsListProps) => {
	const dispatch = useDispatch();
	const sessions = useSelector(selectSessionsForList);

	const [copied, setCopied] = useState(false);

	const copyToClipboard = (pin: string) => {
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 1500);
		navigator.clipboard.writeText(pin);
	};

	const onSessionClicked = (sessionPin: string) => {
		dispatch(setActiveSessionPin(sessionPin));
		onSessionSelected();
	};

	const supportCmd = (pin: string) => {
		return "./build/bin/erigon support --diagnostics.sessions " + pin;
	};

	const renderSessionsTable = () => {
		return (
			<>
				<table className="table-auto rounded-lg shadow-lg bg-white text-left w-fit mb-4">
					<thead>
						<tr className="border-b">
							<th />
							<th className="px-4 py-2">Name</th>
							<th className="px-4 py-2">PIN</th>
							<th className="px-4 py-2">Support cmd</th>
						</tr>
					</thead>
					<tbody>
						{sessions.map((session, index) => {
							return (
								<tr
									className="border-b border-gray-200"
									key={index}
									onClick={() => onSessionClicked(session.pin)}
								>
									<td className="pl-2">{session.active && <CheckIcon />}</td>
									<td className="px-4 py-2">{session.name}</td>
									<td className="px-4 py-2 hover:bg-gray-100">
										{session.pin}{" "}
										<ContentCopyIcon
											onClick={() => copyToClipboard(session.pin)}
											className="cursor-pointer pr-2"
										/>
									</td>
									<td className="px-4 py-2 hover:bg-gray-100">
										{supportCmd(session.pin)}{" "}
										<ContentCopyIcon
											onClick={() => copyToClipboard(supportCmd(session.pin))}
											className="cursor-pointer pr-2"
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				{copied && <InfoAlert />}
			</>
		);
	};

	return <>{sessions.length > 0 && renderSessionsTable()}</>;
};
