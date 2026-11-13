import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { faqService } from '../../services/api';

// Fetch all FAQs (public API)
export const fetchFaqs = createAsyncThunk(
  'faqs/fetchFaqs',
  async (_, { rejectWithValue }) => {
    try {
      const res = await faqService.getFaqs();
      // Handle various response structures:
      // { success: true, data: { faqs: [...], total: 1 } }
      // or { success: true, data: [...] }
      // or res.faqs / res.data
      let faqs =
        res?.data?.faqs ||
        (Array.isArray(res?.data) ? res.data : null) ||
        res?.faqs ||
        (Array.isArray(res) ? res : []);

      if (Array.isArray(faqs)) {
        // Exclude unpublished faqs if specified
        faqs = faqs.filter((f) => f.isPublished !== false);
        // Sort by sortOrder if present
        faqs.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      }

      return faqs;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch FAQs';
      return rejectWithValue(msg);
    }
  }
);

// Vote FAQ helpful (token / protected API)
export const voteFaqHelpful = createAsyncThunk(
  'faqs/voteFaqHelpful',
  async ({ id, isHelpful = true }, { rejectWithValue }) => {
    try {
      const res = await faqService.voteFaq(id, isHelpful);
      return { id, isHelpful, res };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to submit vote';
      return rejectWithValue({ id, msg });
    }
  }
);

const initialState = {
  faqs: [],
  loading: false,
  error: null,
  votingFaqId: null,
  userVotes: {},
};

export const faqSlice = createSlice({
  name: 'faqs',
  initialState,
  reducers: {
    setUserVote: (state, action) => {
      const { id, isHelpful } = action.payload;
      state.userVotes[id] = isHelpful;
    },
    resetFaqs: (state) => {
      state.faqs = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch FAQs
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload || [];
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Vote Helpful
      .addCase(voteFaqHelpful.pending, (state, action) => {
        state.votingFaqId = action.meta.arg.id;
      })
      .addCase(voteFaqHelpful.fulfilled, (state, action) => {
        state.votingFaqId = null;
        const { id, isHelpful, res } = action.payload;
        state.userVotes[id] = isHelpful;

        const targetFaq = state.faqs.find((f) => (f._id || f.id) === id);
        if (targetFaq) {
          if (res?.data?.helpfulCount !== undefined) {
            targetFaq.helpfulCount = res.data.helpfulCount;
          } else if (isHelpful) {
            targetFaq.helpfulCount = (targetFaq.helpfulCount || 0) + 1;
          }

          if (res?.data?.notHelpfulCount !== undefined) {
            targetFaq.notHelpfulCount = res.data.notHelpfulCount;
          } else if (!isHelpful) {
            targetFaq.notHelpfulCount = (targetFaq.notHelpfulCount || 0) + 1;
          }
        }
      })
      .addCase(voteFaqHelpful.rejected, (state) => {
        state.votingFaqId = null;
      });
  },
});

export const { setUserVote, resetFaqs } = faqSlice.actions;
export default faqSlice.reducer;
