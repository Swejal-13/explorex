import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async () => {
    const res = await axios.get('/api/blogs');
    return res.data;
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    items: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchBlogs.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default blogSlice.reducer;