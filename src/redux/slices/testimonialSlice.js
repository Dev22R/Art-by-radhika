import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { testimonialService } from '../../services/api';

// Fetch Top 3 Testimonials for HomePage
export const fetchTopTestimonials = createAsyncThunk(
  'testimonials/fetchTopTestimonials',
  async (limit = 3, { rejectWithValue }) => {
    try {
      const data = await testimonialService.getTestimonials({
        page: 1,
        limit,
        sort: 'latest',
      });
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch top testimonials';
      return rejectWithValue(msg);
    }
  }
);

// Fetch Paginated Testimonials for Feedback Page (Infinite Scroll)
export const fetchTestimonials = createAsyncThunk(
  'testimonials/fetchTestimonials',
  async (params = { page: 1, limit: 10, sort: 'latest' }, { rejectWithValue }) => {
    try {
      const data = await testimonialService.getTestimonials(params);
      return {
        ...data,
        requestedPage: params.page || 1,
      };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch testimonials';
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  // Top 3 for Homepage
  topTestimonials: [],
  topLoading: false,
  topError: null,

  // Feed / Paginated List for Full Page
  testimonials: [],
  stats: {
    averageRating: 5,
    totalReviews: 0,
    distribution: {},
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  },
  loading: false,
  loadingMore: false,
  hasMore: true,
  error: null,
};

const testimonialSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {
    resetTestimonialsState: (state) => {
      state.testimonials = [];
      state.pagination = { total: 0, page: 1, limit: 10, pages: 1 };
      state.hasMore = true;
      state.loading = false;
      state.loadingMore = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Top Testimonials
    builder
      .addCase(fetchTopTestimonials.pending, (state) => {
        state.topLoading = true;
        state.topError = null;
      })
      .addCase(fetchTopTestimonials.fulfilled, (state, action) => {
        state.topLoading = false;
        const resData = action.payload?.data;
        if (resData?.testimonials) {
          state.topTestimonials = resData.testimonials;
        }
      })
      .addCase(fetchTopTestimonials.rejected, (state, action) => {
        state.topLoading = false;
        state.topError = action.payload;
      });

    // Paginated Testimonials
    builder
      .addCase(fetchTestimonials.pending, (state, action) => {
        const page = action.meta.arg?.page || 1;
        if (page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const resData = action.payload?.data;
        const requestedPage = action.payload?.requestedPage || 1;
        const newItems = resData?.testimonials || [];
        const pagination = resData?.pagination || {};
        const stats = resData?.stats || {};

        if (stats.totalReviews !== undefined) {
          state.stats = stats;
        }

        if (pagination.page !== undefined) {
          state.pagination = pagination;
          state.hasMore = (pagination.page || 1) < (pagination.pages || 1);
        } else {
          state.hasMore = newItems.length >= 10;
        }

        if (requestedPage === 1) {
          state.testimonials = newItems;
        } else {
          // Deduplicate items by _id
          const existingIds = new Set(state.testimonials.map((t) => t._id || t.id));
          const uniqueNewItems = newItems.filter((t) => !existingIds.has(t._id || t.id));
          state.testimonials = [...state.testimonials, ...uniqueNewItems];
        }
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      });
  },
});

export const { resetTestimonialsState } = testimonialSlice.actions;
export default testimonialSlice.reducer;
