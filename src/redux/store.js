import {
  configureStore,
  combineReducers,
  applyMiddleware,
} from '@reduxjs/toolkit';
// Redux Persist
// import storage from 'redux-persist/lib/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { booksReducer, userReducer } from './features';

const allReducers = combineReducers({
  user: userReducer,
  books: booksReducer,
});

const rootReducer = (state, action) => {
  if (action.type === 'RESET_APP') {
    state = undefined;
  }

  return allReducers(state, action);
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  debug: true,
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  thunk: true,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PERSIST, PAUSE, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;
