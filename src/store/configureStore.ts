import { persistReducer, persistStore } from "redux-persist";
import { createTransform } from "redux-persist";

const persistConfig = {
	key: "root",
	storage: localStorage,
	transforms: [
		// Add transform to limit data size
		createTransform(
			// Transform state being stored
			(inboundState, key) => {
				if (key === "snapshots") {
					// Limit size of stored snapshots
					return limitDataSize(inboundState);
				}
				return inboundState;
			},
			// Transform state being rehydrated
			(outboundState, key) => outboundState
		)
	],
	// Only persist essential slices
	whitelist: ["essential_slice1", "essential_slice2"]
};
