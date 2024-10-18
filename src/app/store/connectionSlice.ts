import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export enum NodeConnectionType {
	Unknown = "Unknown",
	Local = "Local",
	Remote = "Remote"
}

export interface ConnectionState {
	isConnectedToInternet: boolean;
	isConnectedToNode: boolean;
	nodeConnectionType: NodeConnectionType;
	backendAddress: string;
}

const initialState: ConnectionState = {
	isConnectedToInternet: true,
	isConnectedToNode: true,
	nodeConnectionType: NodeConnectionType.Unknown,
	//backendAddress: window.location.origin
	backendAddress: "http://localhost:8080"
};

export const connectionSlice = createSlice({
	name: "app",
	initialState,
	reducers: {
		setIsConnectedToInternet: (state, action: PayloadAction<boolean>) => {
			state.isConnectedToInternet = action.payload;
		},
		setIsConnectedToNode: (state, action: PayloadAction<boolean>) => {
			state.isConnectedToNode = action.payload;
		},
		setNodeConnectionType: (state, action: PayloadAction<NodeConnectionType>) => {
			state.nodeConnectionType = action.payload;
		},
		setBackendAddress: (state, action: PayloadAction<string>) => {
			state.backendAddress = action.payload;
			console.log("Backend address set to: " + action.payload);
		},
		resetConectionState: () => initialState
	}
});

export const { setIsConnectedToInternet, setIsConnectedToNode, setNodeConnectionType, setBackendAddress, resetConectionState } =
	connectionSlice.actions;

export const selectIsConnectedToInternet = (state: RootState): boolean => state.connection.isConnectedToInternet;
export const selectIsConnectedToNode = (state: RootState): boolean => state.connection.isConnectedToNode;
export const selectNodeConnectionType = (state: RootState): NodeConnectionType => state.connection.nodeConnectionType;
export const selectBackendAddress = (state: RootState): string => state.connection.backendAddress;

export default connectionSlice.reducer;
