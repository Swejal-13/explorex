import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', creds);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message || 'Registration failed'); }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout').catch(() => {});
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, isLoading: false, error: null, isInitialised: false },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,    (s) => { s.isLoading = true; s.error = null; })
      .addCase(loginUser.fulfilled,  (s, a) => { s.isLoading = false; s.user = a.payload; s.isInitialised = true; })
      .addCase(loginUser.rejected,   (s, a) => { s.isLoading = false; s.error = a.payload; s.isInitialised = true; })
      .addCase(registerUser.pending,   (s) => { s.isLoading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.isLoading = false; s.user = a.payload; s.isInitialised = true; })
      .addCase(registerUser.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload; s.isInitialised = true; })
      .addCase(fetchMe.pending,    (s) => { s.isLoading = true; })
      .addCase(fetchMe.fulfilled,  (s, a) => { s.isLoading = false; s.user = a.payload; s.isInitialised = true; })
      .addCase(fetchMe.rejected,   (s) => { s.isLoading = false; s.user = null; s.isInitialised = true; })
      .addCase(logoutUser.fulfilled, (s) => { s.user = null; });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;
