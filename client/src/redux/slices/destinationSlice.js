import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchDestinations = createAsyncThunk(
  'destinations/fetchDestinations',
  async () => {
    const res = await axios.get('/api/destinations');
    return res.data; // must be array OR we normalize below
  }
);

const destinationSlice = createSlice({
  name: 'destinations',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDestinations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDestinations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchDestinations.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default destinationSlice.reducer;