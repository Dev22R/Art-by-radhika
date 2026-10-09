import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userAddressReducer from './slices/userAddressSlice';
import reelsReducer from './slices/reelsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userAddress: userAddressReducer,
    reels: reelsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
