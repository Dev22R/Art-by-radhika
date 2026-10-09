import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reelsService } from '../../services/api';

// Fetch Reels list with sorting and tag filtering
export const fetchReels = createAsyncThunk(
  'reels/fetchReels',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await reelsService.getReels(params);
      return data;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch reels';
      return rejectWithValue(msg);
    }
  }
);

// Toggle Like on a Reel
export const toggleLikeReel = createAsyncThunk(
  'reels/toggleLikeReel',
  async (reelId, { rejectWithValue }) => {
    try {
      const data = await reelsService.likeReel(reelId);
      return { reelId, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to like reel';
      return rejectWithValue({ reelId, msg });
    }
  }
);

// Track / Log Reel Share
export const shareReelAction = createAsyncThunk(
  'reels/shareReel',
  async ({ reelId, platform }, { rejectWithValue }) => {
    try {
      const data = await reelsService.shareReel(reelId, platform);
      return { reelId, platform, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to share reel';
      return rejectWithValue({ reelId, msg });
    }
  }
);

// Fetch Comments for a specific reel
export const fetchReelComments = createAsyncThunk(
  'reels/fetchReelComments',
  async ({ reelId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const data = await reelsService.getComments(reelId, { page, limit });
      return { reelId, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch comments';
      return rejectWithValue({ reelId, msg });
    }
  }
);

// Add Comment to a Reel
export const addReelComment = createAsyncThunk(
  'reels/addReelComment',
  async ({ reelId, text }, { rejectWithValue }) => {
    try {
      const data = await reelsService.addComment(reelId, text);
      return { reelId, data, text };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to post comment';
      return rejectWithValue({ reelId, msg });
    }
  }
);

// Delete Comment from a Reel
export const deleteReelComment = createAsyncThunk(
  'reels/deleteReelComment',
  async ({ reelId, commentId }, { rejectWithValue }) => {
    try {
      const data = await reelsService.deleteComment(reelId, commentId);
      return { reelId, commentId, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete comment';
      return rejectWithValue({ reelId, commentId, msg });
    }
  }
);

// Book Reel Design
export const bookReelDesign = createAsyncThunk(
  'reels/bookReelDesign',
  async ({ reelId, bookingData }, { rejectWithValue }) => {
    try {
      const data = await reelsService.bookReelDesign(reelId, bookingData);
      return { reelId, data };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to book reel design';
      return rejectWithValue(msg);
    }
  }
);

// Track Reel View / Watch Duration
export const trackReelView = createAsyncThunk(
  'reels/trackReelView',
  async ({ reelId, watchDuration }, { rejectWithValue }) => {
    try {
      const data = await reelsService.trackView(reelId, watchDuration);
      return { reelId, watchDuration, data };
    } catch (error) {
      return rejectWithValue({ reelId, error: error.message });
    }
  }
);

const initialState = {
  reels: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  },
  currentFilter: {
    sort: 'trending',
    tag: '',
  },
  loading: false,
  error: null,
  commentsMap: {}, // reelId -> { comments: [], pagination: {}, loading: false, error: null }
  bookingLoading: false,
  bookingSuccess: null,
  bookingError: null,
};

const reelsSlice = createSlice({
  name: 'reels',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.currentFilter = { ...state.currentFilter, ...action.payload };
    },
    clearBookingState: (state) => {
      state.bookingLoading = false;
      state.bookingSuccess = null;
      state.bookingError = null;
    },
    // Local optimistic like toggler for immediate UI responsiveness
    optimisticToggleLike: (state, action) => {
      const reelId = action.payload;
      const reel = state.reels.find((r) => r._id === reelId);
      if (reel) {
        const currentlyLiked = !!reel.isLiked;
        reel.isLiked = !currentlyLiked;
        reel.likeCount = Math.max(0, (reel.likeCount || 0) + (currentlyLiked ? -1 : 1));
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch Reels
    builder
      .addCase(fetchReels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        state.loading = false;
        const reelsData = action.payload?.data?.reels || action.payload?.reels || [];
        state.reels = reelsData;
        if (action.payload?.data?.pagination) {
          state.pagination = action.payload.data.pagination;
        }
      })
      .addCase(fetchReels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Toggle Like Reel
    builder
      .addCase(toggleLikeReel.fulfilled, (state, action) => {
        const { reelId, data } = action.payload;
        const reel = state.reels.find((r) => r._id === reelId);
        if (reel) {
          const resData = data?.data || data;
          if (typeof resData?.isLiked === 'boolean') {
            reel.isLiked = resData.isLiked;
          }
          if (typeof resData?.likeCount === 'number') {
            reel.likeCount = resData.likeCount;
          }
        }
      })
      .addCase(toggleLikeReel.rejected, (state, action) => {
        // Rollback optimistic like if failed
        const reelId = action.payload?.reelId;
        if (reelId) {
          const reel = state.reels.find((r) => r._id === reelId);
          if (reel) {
            reel.isLiked = !reel.isLiked;
            reel.likeCount = Math.max(0, (reel.likeCount || 0) + (reel.isLiked ? 1 : -1));
          }
        }
      });

    // Share Reel
    builder.addCase(shareReelAction.fulfilled, (state, action) => {
      const { reelId } = action.payload;
      const reel = state.reels.find((r) => r._id === reelId);
      if (reel) {
        reel.shareCount = (reel.shareCount || 0) + 1;
      }
    });

    // Fetch Reel Comments
    builder
      .addCase(fetchReelComments.pending, (state, action) => {
        const reelId = action.meta.arg.reelId;
        if (!state.commentsMap[reelId]) {
          state.commentsMap[reelId] = { comments: [], loading: true, error: null };
        } else {
          state.commentsMap[reelId].loading = true;
          state.commentsMap[reelId].error = null;
        }
      })
      .addCase(fetchReelComments.fulfilled, (state, action) => {
        const { reelId, data } = action.payload;
        const commentsList = data?.data?.comments || data?.comments || [];
        const pagination = data?.data?.pagination || data?.pagination || {};
        state.commentsMap[reelId] = {
          comments: commentsList,
          pagination,
          loading: false,
          error: null,
        };
      })
      .addCase(fetchReelComments.rejected, (state, action) => {
        const reelId = action.payload?.reelId || action.meta.arg.reelId;
        if (state.commentsMap[reelId]) {
          state.commentsMap[reelId].loading = false;
          state.commentsMap[reelId].error = action.payload?.msg || 'Failed to load comments';
        }
      });

    // Add Reel Comment
    builder.addCase(addReelComment.fulfilled, (state, action) => {
      const { reelId, data, text } = action.payload;
      const reel = state.reels.find((r) => r._id === reelId);
      if (reel) {
        reel.commentCount = (reel.commentCount || 0) + 1;
      }

      const commentEntry = data?.data?.comment ||
        data?.comment || {
          _id: data?.data?._id || `temp-${Date.now()}`,
          text,
          createdAt: new Date().toISOString(),
          userId: {
            _id: 'me',
            name: 'You',
          },
        };

      if (!state.commentsMap[reelId]) {
        state.commentsMap[reelId] = { comments: [], loading: false, error: null };
      }
      state.commentsMap[reelId].comments = [commentEntry, ...state.commentsMap[reelId].comments];
    });

    // Delete Reel Comment
    builder.addCase(deleteReelComment.fulfilled, (state, action) => {
      const { reelId, commentId } = action.payload;
      const reel = state.reels.find((r) => r._id === reelId);
      if (reel) {
        reel.commentCount = Math.max(0, (reel.commentCount || 0) - 1);
      }
      if (state.commentsMap[reelId]) {
        state.commentsMap[reelId].comments = state.commentsMap[reelId].comments.filter(
          (c) => c._id !== commentId
        );
      }
    });

    // Book Reel Design
    builder
      .addCase(bookReelDesign.pending, (state) => {
        state.bookingLoading = true;
        state.bookingSuccess = null;
        state.bookingError = null;
      })
      .addCase(bookReelDesign.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.bookingSuccess = action.payload?.data || action.payload;
        const reel = state.reels.find((r) => r._id === action.payload.reelId);
        if (reel) {
          reel.bookingCount = (reel.bookingCount || 0) + 1;
        }
      })
      .addCase(bookReelDesign.rejected, (state, action) => {
        state.bookingLoading = false;
        state.bookingError = action.payload;
      });
  },
});

export const { setFilter, clearBookingState, optimisticToggleLike } = reelsSlice.actions;
export default reelsSlice.reducer;
