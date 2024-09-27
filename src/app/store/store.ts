/*import { configureStore } from '@reduxjs/toolkit'
import appReducer from '../store/appSlice'

export const store = configureStore({
  reducer: {
     app: appReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
*/

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import appReducer from "../store/appSlice";
import networkReducer from "../store/networkSlice";
import connectionReducer from "../store/connectionSlice";
import syncStagesReducer from "../store/syncStagesSlice";
import issuesReduces from "../store/issuesSlice";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import headersSlice from "./headersSlice";
import systemInfoSlice from "./systemInfoSlice";
import profileSlice from "./profileSlice";

const persistConfig = {
	key: "root",
	blacklist: ["connection"],
	storage
};

const rootReducer = combineReducers({
	app: appReducer,
	network: networkReducer,
	connection: connectionReducer,
	syncStages: syncStagesReducer,
	issues: issuesReduces,
	headers: headersSlice,
	sysInfo: systemInfoSlice,
	profile: profileSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
			}
		})
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
