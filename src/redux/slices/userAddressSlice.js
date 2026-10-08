import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '../../services/api';
import { logoutUser } from './authSlice';

// Async Thunks for Address Management
export const fetchUserAddresses = createAsyncThunk(
  'address/fetchUserAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const data = await addressService.getAddresses();
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch addresses';
      return rejectWithValue(msg);
    }
  }
);

export const createUserAddress = createAsyncThunk(
  'address/createUserAddress',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await addressService.createAddress(payload);
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to add address';
      return rejectWithValue(msg);
    }
  }
);

export const updateUserAddress = createAsyncThunk(
  'address/updateUserAddress',
  async ({ addressId, payload }, { rejectWithValue }) => {
    try {
      const data = await addressService.updateAddress(addressId, payload);
      return { addressId, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update address';
      return rejectWithValue(msg);
    }
  }
);

export const setDefaultUserAddress = createAsyncThunk(
  'address/setDefaultUserAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const data = await addressService.setDefaultAddress(addressId);
      return { addressId, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to set default address';
      return rejectWithValue(msg);
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  'address/deleteUserAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const data = await addressService.deleteAddress(addressId);
      return { addressId, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete address';
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  addresses: [],
  loading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const userAddressSlice = createSlice({
  name: 'userAddress',
  initialState,
  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },
    clearAddressSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Addresses
    builder
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        let list = [];
        if (Array.isArray(action.payload?.data?.addresses)) {
          list = action.payload.data.addresses;
        } else if (Array.isArray(action.payload?.addresses)) {
          list = action.payload.addresses;
        } else if (Array.isArray(action.payload?.data)) {
          list = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          list = action.payload;
        }
        state.addresses = list;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Address
    builder
      .addCase(createUserAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createUserAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newAddr =
          action.payload?.data?.address ||
          action.payload?.address ||
          action.payload?.data ||
          action.payload;
        if (newAddr && typeof newAddr === 'object' && newAddr._id) {
          if (newAddr.isDefault) {
            state.addresses = state.addresses.map((a) => ({ ...a, isDefault: false }));
          }
          state.addresses.unshift(newAddr);
        }
      })
      .addCase(createUserAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Update Address
    builder
      .addCase(updateUserAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        const updated =
          action.payload?.data?.data?.address ||
          action.payload?.data?.address ||
          action.payload?.data?.data ||
          action.payload?.data;
        const id = action.payload?.addressId;
        if (updated && id) {
          state.addresses = state.addresses.map((a) =>
            a._id === id ? { ...a, ...(typeof updated === 'object' ? updated : {}) } : a
          );
        }
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Set Default Address
    builder
      .addCase(setDefaultUserAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(setDefaultUserAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload?.addressId;
        if (id) {
          state.addresses = state.addresses.map((a) => ({
            ...a,
            isDefault: a._id === id,
          }));
        }
      })
      .addCase(setDefaultUserAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // Delete Address
    builder
      .addCase(deleteUserAddress.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.actionLoading = false;
        const id = action.payload?.addressId;
        if (id) {
          state.addresses = state.addresses.filter((a) => a._id !== id);
        }
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Clear addresses on logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.addresses = [];
        state.loading = false;
        state.actionLoading = false;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.addresses = [];
        state.loading = false;
        state.actionLoading = false;
        state.error = null;
        state.successMessage = null;
      });
  },
});

export const { clearAddressError, clearAddressSuccess } = userAddressSlice.actions;
export default userAddressSlice.reducer;
