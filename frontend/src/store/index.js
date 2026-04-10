import { configureStore } from '@reduxjs/toolkit';
import marketplaceReducer from './slices/marketplaceSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    marketplace: marketplaceReducer,
    auth: authReducer,
  },
});
