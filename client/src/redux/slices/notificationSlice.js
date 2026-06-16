import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async () => {
    const res = await axios.get('http://localhost:5000/api/notifications');
    return res.data;
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
  markAllRead: (state) => {
    state.unreadCount = 0;
  },

  addNotification: (state, action) => {
    state.items.unshift(action.payload);
    state.unreadCount += 1;
  },
},
  extraReducers: (builder) => {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    });
  },
});

export const { markAllRead, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;