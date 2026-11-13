import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userAddressReducer from './slices/userAddressSlice';
import reelsReducer from './slices/reelsSlice';
import categoryReducer from './slices/categorySlice';
import designReducer from './slices/designSlice';
import faqReducer from './slices/faqSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    userAddress: userAddressReducer,
    reels: reelsReducer,
    categories: categoryReducer,
    designs: designReducer,
    faqs: faqReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
