import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryService } from '../../services/api';

// Fetch all categories (with embedded subcategories if provided by API)
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const res = await categoryService.getCategories();
      // Handle response structures: res.data.categories || res.categories || res.data
      const categories = res.data?.categories || res.categories || (Array.isArray(res.data) ? res.data : []);
      return categories;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch categories';
      return rejectWithValue(msg);
    }
  }
);

// Fetch subcategories for a specific category by its slug
export const fetchSubcategoriesByCategorySlug = createAsyncThunk(
  'categories/fetchSubcategoriesByCategorySlug',
  async (categorySlug, { rejectWithValue }) => {
    try {
      if (!categorySlug || categorySlug === 'all') {
        return { categorySlug, subcategories: [] };
      }
      const res = await categoryService.getSubcategories(categorySlug);
      const subcategories =
        res.data?.subcategories ||
        res.subcategories ||
        (Array.isArray(res.data) ? res.data : []);
      return { categorySlug, subcategories, category: res.data?.category || null };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch subcategories';
      return rejectWithValue({ categorySlug, msg });
    }
  }
);

const initialState = {
  categories: [],
  selectedCategory: 'all',
  subcategories: [],
  selectedSubcategory: 'all',
  loading: false,
  subcategoriesLoading: false,
  error: null,
};

export const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      const newCategorySlug = action.payload;
      state.selectedCategory = newCategorySlug;
      state.selectedSubcategory = 'all';

      if (newCategorySlug === 'all') {
        state.subcategories = [];
      } else {
        // If categories list already has embedded subcategories for this category, populate them
        const found = state.categories.find(
          (c) => (c.slug || c._id || c.name?.toLowerCase()) === newCategorySlug
        );
        if (found && Array.isArray(found.subcategories) && found.subcategories.length > 0) {
          state.subcategories = found.subcategories;
        }
      }
    },
    setSelectedSubcategory: (state, action) => {
      state.selectedSubcategory = action.payload;
    },
    resetCategoryFilters: (state) => {
      state.selectedCategory = 'all';
      state.selectedSubcategory = 'all';
      state.subcategories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload || [];

        // If a category was already selected, update its subcategories if available
        if (state.selectedCategory !== 'all') {
          const found = state.categories.find(
            (c) => (c.slug || c._id) === state.selectedCategory
          );
          if (found && Array.isArray(found.subcategories) && found.subcategories.length > 0) {
            state.subcategories = found.subcategories;
          }
        }
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch categories';
      })

      // Fetch Subcategories by Slug
      .addCase(fetchSubcategoriesByCategorySlug.pending, (state) => {
        state.subcategoriesLoading = true;
      })
      .addCase(fetchSubcategoriesByCategorySlug.fulfilled, (state, action) => {
        state.subcategoriesLoading = false;
        if (action.payload?.categorySlug === state.selectedCategory) {
          state.subcategories = action.payload.subcategories || [];
        }
      })
      .addCase(fetchSubcategoriesByCategorySlug.rejected, (state) => {
        state.subcategoriesLoading = false;
      });
  },
});

export const { setSelectedCategory, setSelectedSubcategory, resetCategoryFilters } =
  categorySlice.actions;

export default categorySlice.reducer;
