import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Heart,
  Clock,
  Crown,
  Eye,
  Check,
  X,
  Layers,
  Feather,
  Sun,
  User,
  Bell,
  Gift,
  Flame,
  Footprints,
  RefreshCw,
  ArrowRight,
  Play,
  SlidersHorizontal,
} from 'lucide-react';
import {
  fetchCategories,
  fetchSubcategoriesByCategorySlug,
  setSelectedCategory,
  setSelectedSubcategory,
  resetCategoryFilters,
} from '../redux/slices/categorySlice';
import {
  fetchDesigns,
  setSearchQuery,
  resetDesignFilters,
  updateDesignLikesLocally,
} from '../redux/slices/designSlice';

// Dynamic Icon Map for category icons from backend
const ICON_MAP = {
  crown: Crown,
  sparkles: Sparkles,
  feather: Feather,
  sun: Sun,
  heart: Heart,
  user: User,
  bell: Bell,
  gift: Gift,
  flame: Flame,
  footprints: Footprints,
  layers: Layers,
};

const getCategoryIcon = (iconName) => {
  if (!iconName) return Sparkles;
  const lower = iconName.toLowerCase();
  const IconComponent = ICON_MAP[lower] || Sparkles;
  return IconComponent;
};

export const DesignsPage = ({
  onSelectDesign,
  onBookDesign,
  favorites = [],
  onToggleLike,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state for Categories
  const {
    categories,
    selectedCategory,
    subcategories,
    selectedSubcategory,
    loading: categoriesLoading,
    subcategoriesLoading,
  } = useSelector((state) => state.categories);

  // Redux state for Designs
  const {
    designs,
    loading: designsLoading,
    error: designsError,
    searchQuery,
  } = useSelector((state) => state.designs);

  // Local state for debounced search or direct input
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  // 1. Initial Load: Fetch Categories and Designs on Mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // 2. Fetch designs whenever filters change
  useEffect(() => {
    dispatch(
      fetchDesigns({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
        search: searchQuery || undefined,
      })
    );
  }, [dispatch, selectedCategory, selectedSubcategory, searchQuery]);

  // 3. Debounce search input to redux
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(searchInput));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, dispatch]);

  // Handle Category selection
  const handleSelectCategory = (catSlug) => {
    dispatch(setSelectedCategory(catSlug));
    if (catSlug !== 'all') {
      dispatch(fetchSubcategoriesByCategorySlug(catSlug));
    }
  };

  // Handle Subcategory selection
  const handleSelectSubcategory = (subSlug) => {
    dispatch(setSelectedSubcategory(subSlug));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchInput('');
    dispatch(resetCategoryFilters());
    dispatch(resetDesignFilters());
  };

  // Find active category details
  const activeCategoryObj = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return categories.find(
      (c) => (c.slug || c._id) === selectedCategory
    );
  }, [categories, selectedCategory]);

  // Available subcategories for the active category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') return [];
    if (subcategories && subcategories.length > 0) return subcategories;
    if (activeCategoryObj && Array.isArray(activeCategoryObj.subcategories)) {
      return activeCategoryObj.subcategories;
    }
    return [];
  }, [selectedCategory, subcategories, activeCategoryObj]);

  // Filtered designs on client-side (for responsive fallback / instant search)
  const filteredDesigns = useMemo(() => {
    return designs.filter((item) => {
      // Category check
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory ||
        item.categoryName?.toLowerCase() === selectedCategory?.toLowerCase() ||
        item.raw?.category === selectedCategory ||
        item.raw?.categoryId?._id === selectedCategory ||
        item.raw?.categoryId?.slug === selectedCategory;

      // Subcategory check
      const matchesSubcategory =
        selectedSubcategory === 'all' ||
        item.subcategory === selectedSubcategory ||
        item.subcategoryName?.toLowerCase() === selectedSubcategory?.toLowerCase() ||
        item.raw?.subcategory === selectedSubcategory ||
        item.raw?.subcategoryId?._id === selectedSubcategory ||
        item.raw?.subcategoryId?.slug === selectedSubcategory;

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.style.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (Array.isArray(item.motifs) &&
          item.motifs.some((m) => m.toLowerCase().includes(q)));

      return matchesCategory && matchesSubcategory && matchesSearch;
    });
  }, [designs, selectedCategory, selectedSubcategory, searchQuery]);

  // Like handler that triggers callback and local redux update
  const handleLike = (design) => {
    const isLiked = favorites.includes(design.id) || favorites.includes(design._id);
    if (onToggleLike) {
      onToggleLike(design.id || design._id);
    }
    dispatch(
      updateDesignLikesLocally({
        designId: design.id || design._id,
        increment: !isLiked,
      })
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-5 sm:space-y-7 pb-20">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pt-1 sm:pt-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8A3324]/10 border border-[#8A3324]/20 text-[#8A3324] text-[11px] sm:text-xs uppercase font-bold tracking-widest"
        >
          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
          <span>Curated Portfolio &amp; Master Lookbook</span>
        </motion.div>
        {/* <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="font-royal text-2xl sm:text-3xl md:text-4xl font-bold text-[#4A151B] tracking-tight"
        >
          Signature Mehndi Masterpieces
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs sm:text-sm text-[#4A151B]/75 max-w-xl mx-auto"
        >
          Handcrafted royal henna patterns tailored for brides, celebrations &amp; heritage lovers.
        </motion.p> */}
      </div>

      {/* Main Filter Section */}
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        {/* Search Bar - Native App Feel */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A3324] absolute left-3.5 sm:left-4 top-3 sm:top-3.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search designs, motifs, lotus, peacock..."
            className="w-full pl-10 sm:pl-11 pr-10 py-2.5 sm:py-3 rounded-full border border-[#D4AF37]/40 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324]/25 focus:border-[#8A3324] shadow-xs transition-all text-[#4A151B] placeholder:text-[#4A151B]/40"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                dispatch(setSearchQuery(''));
              }}
              className="absolute right-3 top-2.5 sm:top-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Carousel/Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#8A3324] flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              Categories
            </span>
            {categoriesLoading && (
              <span className="text-[10px] sm:text-[11px] text-[#8A3324]/70 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0">
            {/* "All" Category Pill */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectCategory('all')}
              className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${selectedCategory === 'all'
                  ? 'bg-[#4A151B] text-[#D4AF37] shadow-sm border border-[#D4AF37] ring-2 ring-[#D4AF37]/30'
                  : 'bg-white text-[#4A151B] border border-[#D4AF37]/25 hover:bg-[#F3ECE1] hover:border-[#D4AF37]/50'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>All Masterpieces</span>
            </motion.button>

            {/* Dynamic Categories from API */}
            {categories.map((cat) => {
              const catIdentifier = cat.slug || cat._id;
              const isActive = selectedCategory === catIdentifier;
              const IconComp = getCategoryIcon(cat.icon);

              return (
                <motion.button
                  key={cat._id || cat.slug || cat.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectCategory(catIdentifier)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${isActive
                      ? 'bg-[#4A151B] text-[#D4AF37] shadow-sm border border-[#D4AF37] ring-2 ring-[#D4AF37]/30'
                      : 'bg-white text-[#4A151B] border border-[#D4AF37]/25 hover:bg-[#F3ECE1] hover:border-[#D4AF37]/50'
                    }`}
                >
                  <IconComp className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{cat.name}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sub-Category Filter (Shows when a category is selected & has subcategories) */}
        <AnimatePresence>
          {selectedCategory !== 'all' && availableSubcategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-2.5 sm:p-3 rounded-2xl bg-[#F3ECE1]/70 border border-[#D4AF37]/30 space-y-2 overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#611C23] flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#8A3324]" />
                  {activeCategoryObj?.name || 'Category'} Sub-Styles:
                </span>
                {subcategoriesLoading && (
                  <span className="text-[10px] text-[#8A3324] flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
                <button
                  onClick={() => handleSelectSubcategory('all')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedSubcategory === 'all'
                      ? 'bg-[#8A3324] text-white shadow-xs font-bold'
                      : 'bg-white text-[#4A151B] border border-[#D4AF37]/30 hover:bg-white/90'
                    }`}
                >
                  All {activeCategoryObj?.name || 'Styles'}
                </button>

                {availableSubcategories.map((sub) => {
                  const subIdentifier = sub.slug || sub._id;
                  const isSubActive = selectedSubcategory === subIdentifier;

                  return (
                    <button
                      key={sub._id || sub.slug || sub.name}
                      onClick={() => handleSelectSubcategory(subIdentifier)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${isSubActive
                          ? 'bg-[#8A3324] text-white shadow-xs font-bold'
                          : 'bg-white text-[#4A151B] border border-[#D4AF37]/30 hover:bg-white/90'
                        }`}
                    >
                      <span>{sub.name}</span>
                      {typeof sub.designCount === 'number' && sub.designCount > 0 && (
                        <span className="text-[10px] opacity-80">({sub.designCount})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count & Reset Header */}
        <div className="flex items-center justify-between pt-0.5 px-1 text-xs text-[#8A3324]">
          <span className="text-[11px] sm:text-xs font-medium text-[#4A151B]/75">
            Showing <strong className="text-[#4A151B] font-bold">{filteredDesigns.length}</strong> {filteredDesigns.length === 1 ? 'masterpiece' : 'masterpieces'}
          </span>

          {(selectedCategory !== 'all' || selectedSubcategory !== 'all' || searchInput) && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-[#8A3324] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#D4AF37]/30 shadow-xs"
            >
              <X className="w-3 h-3" />
              <span>Reset</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Loading Skeleton - 2 Columns on Mobile */}
      {designsLoading && designs.length === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl sm:rounded-3xl border border-[#D4AF37]/20 p-2 sm:p-3 space-y-2.5 animate-pulse"
            >
              <div className="aspect-[4/5] bg-gray-200 rounded-xl sm:rounded-2xl" />
              <div className="h-3.5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-6 bg-gray-200 rounded-lg w-full pt-1" />
            </div>
          ))}
        </div>
      ) : designsError && filteredDesigns.length === 0 ? (
        /* Error State */
        <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-red-200 p-6 sm:p-8 space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-royal text-lg sm:text-xl font-bold text-[#4A151B]">
            Unable to Load Designs
          </h3>
          <p className="text-xs text-red-600/80 leading-relaxed">
            {designsError || 'There was a problem fetching design items from the server.'}
          </p>
          <button
            onClick={() => {
              dispatch(
                fetchDesigns({
                  category: selectedCategory !== 'all' ? selectedCategory : undefined,
                  subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
                  search: searchQuery || undefined,
                })
              );
            }}
            className="px-5 py-2.5 rounded-full bg-[#4A151B] text-[#FAF6F0] text-xs font-bold hover:bg-[#611C23] transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      ) : filteredDesigns.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 sm:py-16 bg-white rounded-3xl border border-[#D4AF37]/20 p-6 sm:p-8 space-y-4 max-w-md mx-auto shadow-xs">
          <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto animate-pulse" />
          <h3 className="font-royal text-lg sm:text-xl font-bold text-[#4A151B]">
            No matching designs found
          </h3>
          <p className="text-xs text-[#4A151B]/75 leading-relaxed">
            We couldn't find any mehndi designs matching your selected category, subcategory,
            or search filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-full bg-[#4A151B] text-[#FAF6F0] text-xs font-bold hover:bg-[#611C23] transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Designs Grid - Strictly 2 Columns on Mobile, 3 on md, 4 on lg */
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6"
        >
          <AnimatePresence>
            {filteredDesigns.map((design, index) => {
              const isLiked =
                favorites.includes(design.id) || favorites.includes(design._id);
              const targetSlug = design.slug || design._id || design.id;

              return (
                <motion.div
                  layout
                  key={design.id || design._id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/designs/${targetSlug}`)}
                  className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#D4AF37]/25 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Media / Image Box - Aspect 4/5 for App-like vertical preview */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#1A0A0C] flex items-center justify-center">
                    {/* Ambient Blurred Backdrop */}
                    <img
                      src={design.coverImage || design.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                    />

                    {/* Foreground Image */}
                    <img
                      src={design.coverImage || design.image}
                      alt={design.title}
                      className="relative z-[1] max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          design.fallbackImage ||
                          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';
                      }}
                    />

                    {/* Gradient Scrims */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[2]" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none z-[2]" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 z-10">
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#1A0D0E]/85 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/35 shadow-xs tracking-wider uppercase line-clamp-1 max-w-[70%]">
                        {design.style || design.categoryName || 'Bridal Henna'}
                      </span>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(design);
                        }}
                        className={`p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all active:scale-75 cursor-pointer ${isLiked
                            ? 'bg-[#E63946] text-white shadow-md'
                            : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                        aria-label="Add to favorites"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom Image Stats (Duration & Video pill) */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] sm:text-[11px] text-white/90 z-10">
                      <span className="flex items-center gap-1 font-medium bg-black/60 px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-xs">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#D4AF37]" />
                        <span>{design.duration}</span>
                      </span>

                      {design.videoUrl && (
                        <span className="flex items-center gap-1 bg-[#8A3324]/85 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                          <Play className="w-2.5 h-2.5 fill-white" />
                          <span>Reel</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-[#FFFDF9]">
                    <div className="space-y-1">
                      <h3 className="font-royal text-xs sm:text-sm font-bold text-[#4A151B] group-hover:text-[#8A3324] transition-colors line-clamp-1">
                        {design.title}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-[#8A3324]/85 line-clamp-1 font-medium">
                        {design.subcategoryName || design.subCategory || design.complexity || 'Bespoke Art'}
                      </p>
                    </div>

                    {/* Price and View Action Row */}
                    <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between gap-1">
                      <div>
                        {design.discountedPrice ? (
                          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                            <span className="font-royal font-bold text-xs sm:text-sm text-[#4A151B]">
                              ₹{design.discountedPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-gray-400 line-through">
                              ₹{design.price.toLocaleString('en-IN')}
                            </span>
                          </div>
                        ) : (
                          <span className="font-royal font-bold text-xs sm:text-sm text-[#4A151B]">
                            {design.priceEstimate}
                          </span>
                        )}
                      </div>

                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F3ECE1] group-hover:bg-[#4A151B] text-[#8A3324] group-hover:text-[#D4AF37] flex items-center justify-center transition-colors shrink-0 shadow-xs">
                        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};
