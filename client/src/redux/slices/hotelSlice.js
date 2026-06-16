import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async () => {
    const res = await axios.get('/api/hotels');
    return res.data;
  }
);

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.data || [];
      })
      .addCase(fetchHotels.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default hotelSlice.reducer;