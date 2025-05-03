// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import templateReducer from './slices/templateSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'event', 'template'] // only these will be persisted
};

const rootReducer = combineReducers({
  auth: authReducer,
  event: eventReducer,
  template: templateReducer,
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
