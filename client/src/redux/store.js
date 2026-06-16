import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import destinationReducer  from './slices/destinationSlice';
import hotelReducer        from './slices/hotelSlice';
import bookingReducer      from './slices/bookingSlice';
import blogReducer         from './slices/blogSlice';
import wishlistReducer     from './slices/wishlistSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer           from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:         authReducer,
    destinations: destinationReducer,
    hotels:       hotelReducer,
    bookings:     bookingReducer,
    blogs:        blogReducer,
    wishlist:     wishlistReducer,
    notifications:notificationReducer,
    ui:           uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['auth/setUser'] } }),
});

export default store;
