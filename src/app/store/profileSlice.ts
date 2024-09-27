import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { selectActiveNodeId } from "./appSlice";

export interface NodeProfileData {
	nodeId: string;
	profileData: ProfileData[];
}

export interface ProfileData {
	name: string;
	profile: Profile[];
}

export interface Profile {
	date: string;
	data: string;
}

export interface ProfileState {
	profileData: NodeProfileData[];
}

const initialState: ProfileState = {
	profileData: []
};

export const profileSlice = createSlice({
	name: "profile",
	initialState,
	reducers: {
		addProfile: (state, action: PayloadAction<{ nodeId: string; profileName: string; data: string }>) => {
			let nodeIdx = state.profileData.findIndex((pdata) => pdata.nodeId === action.payload.nodeId);
			if (nodeIdx !== -1) {
				let profileIdx = state.profileData[nodeIdx].profileData.findIndex((profile) => profile.name === action.payload.profileName);
				if (profileIdx !== -1) {
					state.profileData[nodeIdx].profileData[profileIdx].profile.push({ date: new Date().toISOString(), data: action.payload.data });
					// max pprof is 10 in order to not store to mutch data
					if (state.profileData[nodeIdx].profileData[profileIdx].profile.length > 10) {
						state.profileData[nodeIdx].profileData[profileIdx].profile.shift();
					}
				} else {
					state.profileData[nodeIdx].profileData.push({
						name: action.payload.profileName,
						profile: [{ date: new Date().toISOString(), data: action.payload.data }]
					});
				}
			} else {
				state.profileData.push({
					nodeId: action.payload.nodeId,
					profileData: [{ name: action.payload.profileName, profile: [{ date: new Date().toISOString(), data: action.payload.data }] }]
				});
			}
		},
		resetSyncStagesState: () => initialState
	}
});

export const { addProfile } = profileSlice.actions;

export const selectAllProfileData = (state: RootState): NodeProfileData[] => state.profile.profileData;
export const selectAllProfileDataForNode = createSelector(
	[selectAllProfileData, selectActiveNodeId],
	(profData, selectActiveNodeId): ProfileData[] => {
		let result: ProfileData[] = [];
		profData.forEach((pdata) => {
			if (pdata.nodeId === selectActiveNodeId) {
				result = pdata.profileData;
			}
		});
		return result;
	}
);
/*export const selectSnapshotDownloadStatusesForNode = createSelector(
	[selectSnapshotDownloadStatus, selectActiveNodeId],
	(downloadStatus, activeNodeId): SnapshotDownloadStatus => {
		let result: SnapshotDownloadStatus = {} as SnapshotDownloadStatus;
		downloadStatus.forEach((status) => {
			if (status.nodeId === activeNodeId) {
				result = status.downloadStatus;
			}
		});

		return result;
	}
);*/

export default profileSlice.reducer;
