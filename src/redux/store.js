// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'event'] // only auth will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  event: eventReducer,
  // Add other reducers here as your app grows
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
