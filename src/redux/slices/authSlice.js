import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api';

// Async Thunks
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await authService.signup(payload);
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Signup failed. Please try again.';
      return rejectWithValue(msg);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Login failed. Please verify your credentials.';
      return rejectWithValue(msg);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getMe();
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch user profile';
      return rejectWithValue(msg);
    }
  }
);

export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authService.completeProfile(formData);
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to complete profile. Please try again.';
      return rejectWithValue(msg);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authService.updateProfile(formData);
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update profile. Please try again.';
      return rejectWithValue(msg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.logout();
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Logout failed';
      return rejectWithValue(msg);
    } finally {
      localStorage.clear();
    }
  }
);

// Initial state from localStorage
const storedToken = localStorage.getItem('accessToken');
const storedRefreshToken = localStorage.getItem('refreshToken');
let storedUser = null;
try {
  const userJson = localStorage.getItem('authUser');
  if (userJson) storedUser = JSON.parse(userJson);
} catch {
  storedUser = null;
}

const initialState = {
  user: storedUser,
  accessToken: storedToken || null,
  refreshToken: storedRefreshToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  updatingProfile: false,
  error: null,
  isProfileCompleted: storedUser?.isProfileCompleted || false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    forceLogout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isProfileCompleted = false;
      state.loading = false;
      state.error = null;
      localStorage.clear();
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload?.data || action.payload;
        if (payloadData?.user) {
          state.user = payloadData.user;
          localStorage.setItem('authUser', JSON.stringify(payloadData.user));
        }
        if (payloadData?.accessToken) {
          state.accessToken = payloadData.accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('accessToken', payloadData.accessToken);
        }
        if (payloadData?.refreshToken) {
          state.refreshToken = payloadData.refreshToken;
          localStorage.setItem('refreshToken', payloadData.refreshToken);
        }
        if (payloadData?.isProfileCompleted !== undefined) {
          state.isProfileCompleted = payloadData.isProfileCompleted;
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const payloadData = action.payload?.data || action.payload;
        if (payloadData?.user) {
          state.user = payloadData.user;
          localStorage.setItem('authUser', JSON.stringify(payloadData.user));
        }
        if (payloadData?.accessToken) {
          state.accessToken = payloadData.accessToken;
          state.isAuthenticated = true;
          localStorage.setItem('accessToken', payloadData.accessToken);
        }
        if (payloadData?.refreshToken) {
          state.refreshToken = payloadData.refreshToken;
          localStorage.setItem('refreshToken', payloadData.refreshToken);
        }
        if (payloadData?.isProfileCompleted !== undefined) {
          state.isProfileCompleted = payloadData.isProfileCompleted;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch User Profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        const userData = action.payload?.data?.user || action.payload?.user || action.payload?.data;
        if (userData) {
          state.user = userData;
          state.isAuthenticated = true;
          if (userData.isProfileCompleted !== undefined) {
            state.isProfileCompleted = userData.isProfileCompleted;
          }
          localStorage.setItem('authUser', JSON.stringify(userData));
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        // If 401 or token invalid
        if (action.payload && typeof action.payload === 'string' && action.payload.includes('401')) {
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.isAuthenticated = false;
          localStorage.clear();
        }
      });

    // Complete Profile
    builder
      .addCase(completeProfile.pending, (state) => {
        state.updatingProfile = true;
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.updatingProfile = false;
        const userData = action.payload?.data?.user || action.payload?.user || action.payload?.data;
        if (userData) {
          state.user = userData;
          state.isProfileCompleted = userData.isProfileCompleted !== undefined ? userData.isProfileCompleted : true;
          localStorage.setItem('authUser', JSON.stringify(userData));
        }
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.updatingProfile = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updatingProfile = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updatingProfile = false;
        const userData = action.payload?.data?.user || action.payload?.user || action.payload?.data;
        if (userData) {
          state.user = userData;
          if (userData.isProfileCompleted !== undefined) {
            state.isProfileCompleted = userData.isProfileCompleted;
          }
          localStorage.setItem('authUser', JSON.stringify(userData));
        }
      })
    // Logout User
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isProfileCompleted = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isProfileCompleted = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { forceLogout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
