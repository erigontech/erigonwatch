import statsjson from "./../../syncStats.json";
import peersjson from "./../../peersStats.json";
import { messageData } from "./sync_messages";

export const getSyncData = (idx: number): any => {
	if (Array.isArray(messageData)) {
		return statsjson[idx];
	} else {
		return null;
	}
};

export const getPeersData = (idx: number): any => {
	if (Array.isArray(peersjson)) {
		return peersjson[idx];
	} else {
		return null;
	}
};
