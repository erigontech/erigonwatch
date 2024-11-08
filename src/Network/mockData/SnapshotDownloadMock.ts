import statsjson from "./../../syncStats.json";
import peersjson from "./../../peersStats.json";

export const getSyncData = (idx: number): any => {
	if (Array.isArray(statsjson)) {
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
