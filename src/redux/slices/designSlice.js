import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { designService } from '../../services/api';

// Helper to normalize design objects from API responses into a clean UI format
export const normalizeDesign = (item) => {
  if (!item) return null;

  // Handle images formatted as string, object { url }, or array of objects/strings
  const imagesList = Array.isArray(item.images)
    ? item.images.map((img) => (typeof img === 'string' ? { url: img } : img))
    : [];

  const coverImage =
    item.coverImage ||
    (imagesList.length > 0 ? imagesList[0]?.url : null) ||
    (typeof item.image === 'string' ? item.image : item.image?.url) ||
    item.imageUrl ||
    item.thumbnail ||
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';

  const categoryName =
    typeof item.categoryId === 'object' && item.categoryId?.name
      ? item.categoryId.name
      : typeof item.category === 'object' && item.category?.name
      ? item.category.name
      : typeof item.category === 'string'
      ? item.category
      : 'Bridal Henna';

  const categorySlug =
    typeof item.categoryId === 'object' && item.categoryId?.slug
      ? item.categoryId.slug
      : typeof item.category === 'object' && item.category?.slug
      ? item.category.slug
      : typeof item.category === 'string'
      ? item.category
      : '';

  const subcategoryName =
    typeof item.subCategoryId === 'object' && item.subCategoryId?.name
      ? item.subCategoryId.name
      : typeof item.subCategory === 'object' && item.subCategory?.name
      ? item.subCategory.name
      : typeof item.subCategory === 'string'
      ? item.subCategory
      : typeof item.subcategoryId === 'object' && item.subcategoryId?.name
      ? item.subcategoryId.name
      : typeof item.subcategory === 'object' && item.subcategory?.name
      ? item.subcategory.name
      : typeof item.subcategory === 'string'
      ? item.subcategory
      : '';

  const subcategorySlug =
    typeof item.subCategoryId === 'object' && item.subCategoryId?.slug
      ? item.subCategoryId.slug
      : typeof item.subCategory === 'object' && item.subCategory?.slug
      ? item.subCategory.slug
      : typeof item.subCategory === 'string'
      ? item.subCategory
      : typeof item.subcategoryId === 'object' && item.subcategoryId?.slug
      ? item.subcategoryId.slug
      : typeof item.subcategory === 'object' && item.subcategory?.slug
      ? item.subcategory.slug
      : typeof item.subcategory === 'string'
      ? item.subcategory
      : '';

  const motifs = Array.isArray(item.tags)
    ? item.tags
    : Array.isArray(item.motifs)
    ? item.motifs
    : typeof item.tags === 'string'
    ? item.tags.split(',').map((s) => s.trim()).filter(Boolean)
    : typeof item.motifs === 'string'
    ? item.motifs.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const priceVal = typeof item.price === 'number' ? item.price : 0;
  const discountedPriceVal = typeof item.discountedPrice === 'number' ? item.discountedPrice : 0;

  const priceEstimate =
    item.priceEstimate ||
    (priceVal ? `₹${priceVal.toLocaleString('en-IN')}` : discountedPriceVal ? `₹${discountedPriceVal.toLocaleString('en-IN')}` : '₹4,999');

  const likesCount =
    typeof item.likeCount === 'number'
      ? item.likeCount
      : typeof item.likesCount === 'number'
      ? item.likesCount
      : typeof item.likes === 'number'
      ? item.likes
      : Array.isArray(item.likes)
      ? item.likes.length
      : 0;

  return {
    id: item._id || item.id || `des-${Math.random().toString(36).substring(2, 9)}`,
    _id: item._id || item.id,
    title: item.title || item.name || 'Bespoke Royal Mehndi',
    slug: item.slug || item._id || item.id || '',
    designCode: item.designCode || '',
    category: categorySlug,
    categoryName,
    subcategory: subcategorySlug,
    subcategoryName,
    style: item.style || categoryName || 'Heritage Rajwada',
    image: coverImage,
    coverImage,
    images: imagesList.length > 0 ? imagesList : [{ url: coverImage }],
    video: item.video || null,
    fallbackImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
    description:
      item.description ||
      'Intricate, bespoke royal mehndi pattern handcrafted with natural organic henna.',
    duration: item.estimatedTime || item.duration || item.estimatedDuration || '3 - 4 Hours',
    estimatedTime: item.estimatedTime || item.duration || '3 - 4 Hours',
    stainDepth: item.stainDepth || 'Deep Mahogany Dark (48-72h)',
    complexity: item.complexity || item.density || 'Royal Heavy',
    placement: Array.isArray(item.placement) ? item.placement : item.hands ? [item.hands] : ['Full Arm'],
    hands: item.hands || (Array.isArray(item.placement) ? item.placement.join(', ') : 'Full Arm'),
    priceEstimate,
    price: priceVal || discountedPriceVal || 4999,
    discountedPrice: discountedPriceVal || null,
    currency: item.currency || 'INR',
    likes: likesCount,
    likeCount: likesCount,
    viewCount: typeof item.viewCount === 'number' ? item.viewCount : 0,
    bookingCount: typeof item.bookingCount === 'number' ? item.bookingCount : 0,
    isLiked: !!item.isLiked,
    isBookable: item.isBookable !== false,
    createdBy: item.createdBy || { name: 'Art By Radhika Master Artisan' },
    motifs,
    tags: motifs,
    trending: !!item.isTrending || !!item.trending || !!item.isFeatured,
    isFeatured: !!item.isFeatured,
    raw: item,
  };
};

// Fetch designs with optional query filters (category, subcategory, search, complexity, etc.)
export const fetchDesigns = createAsyncThunk(
  'designs/fetchDesigns',
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await designService.getDesigns(params);
      const rawList =
        res.data?.designs ||
        res.designs ||
        (Array.isArray(res.data) ? res.data : []) ||
        [];

      const normalizedList = rawList.map(normalizeDesign).filter(Boolean);
      const pagination = res.data?.pagination || res.pagination || null;

      return {
        designs: normalizedList,
        pagination,
        filters: params,
      };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch designs';
      return rejectWithValue(msg);
    }
  }
);

// Fetch a single design by slug or ID
export const fetchDesignBySlug = createAsyncThunk(
  'designs/fetchDesignBySlug',
  async (slugOrId, { rejectWithValue }) => {
    try {
      const res = await designService.getDesignBySlug(slugOrId);
      const rawItem = res.data?.design || res.design || res.data || res;
      return normalizeDesign(rawItem);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch design details';
      return rejectWithValue(msg);
    }
  }
);

// Toggle design like
export const toggleLikeDesign = createAsyncThunk(
  'designs/toggleLikeDesign',
  async (designId, { rejectWithValue }) => {
    try {
      const res = await designService.likeDesign(designId);
      return { designId, data: res };
    } catch (error) {
      // Don't hard-fail if like API is not present; return local toggle info
      return { designId, isFallback: true };
    }
  }
);

const initialState = {
  designs: [],
  currentDesign: null,
  loading: false,
  detailLoading: false,
  error: null,
  searchQuery: '',
  selectedComplexity: 'all',
  sortBy: 'featured',
  pagination: null,
};

export const designSlice = createSlice({
  name: 'designs',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedComplexity: (state, action) => {
      state.selectedComplexity = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setCurrentDesign: (state, action) => {
      state.currentDesign = action.payload;
    },
    clearCurrentDesign: (state) => {
      state.currentDesign = null;
    },
    resetDesignFilters: (state) => {
      state.searchQuery = '';
      state.selectedComplexity = 'all';
      state.sortBy = 'featured';
    },
    updateDesignLikesLocally: (state, action) => {
      const { designId, increment } = action.payload;
      const design = state.designs.find((d) => d.id === designId || d._id === designId);
      if (design) {
        design.likes = Math.max(0, (design.likes || 0) + (increment ? 1 : -1));
      }
      if (state.currentDesign && (state.currentDesign.id === designId || state.currentDesign._id === designId)) {
        state.currentDesign.likes = Math.max(0, (state.currentDesign.likes || 0) + (increment ? 1 : -1));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Designs
      .addCase(fetchDesigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.loading = false;
        state.designs = action.payload.designs || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load designs';
      })

      // Fetch Design by Slug
      .addCase(fetchDesignBySlug.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchDesignBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentDesign = action.payload;
      })
      .addCase(fetchDesignBySlug.rejected, (state) => {
        state.detailLoading = false;
      })

      // Toggle Like
      .addCase(toggleLikeDesign.fulfilled, (state, action) => {
        const { designId } = action.payload;
        const design = state.designs.find((d) => d.id === designId || d._id === designId);
        if (design) {
          design.likes = (design.likes || 0) + 1;
        }
      });
  },
});

export const {
  setSearchQuery,
  setSelectedComplexity,
  setSortBy,
  setCurrentDesign,
  clearCurrentDesign,
  resetDesignFilters,
  updateDesignLikesLocally,
} = designSlice.actions;

export default designSlice.reducer;
