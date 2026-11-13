import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8A3324]/10 border border-[#8A3324]/20 text-[#8A3324] text-xs uppercase font-bold tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Curated Portfolio &amp; Master Lookbook</span>
        </div>


      </div>

      {/* Main Filter Section */}
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A3324] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by motif (e.g. Lotus, Portrait, Jharokha, Peacock, Arabic)..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-[#D4AF37]/40 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm transition-all text-[#4A151B] placeholder:text-[#4A151B]/40"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                dispatch(setSearchQuery(''));
              }}
              className="absolute right-3.5 top-3.5 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Carousel/Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A3324] flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
              Categories
            </span>
            {categoriesLoading && (
              <span className="text-[11px] text-[#8A3324]/70 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Loading categories...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1.5 scroll-smooth">
            {/* "All" Category Pill */}
            <button
              onClick={() => handleSelectCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${selectedCategory === 'all'
                ? 'bg-[#4A151B] text-[#D4AF37] shadow-md scale-105 border border-[#D4AF37]/60 ring-2 ring-[#D4AF37]/30'
                : 'bg-white text-[#4A151B] border border-[#D4AF37]/25 hover:bg-[#F3ECE1] hover:border-[#D4AF37]/50'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Masterpieces</span>
            </button>

            {/* Dynamic Categories from API */}
            {categories.map((cat) => {
              const catIdentifier = cat.slug || cat._id;
              const isActive = selectedCategory === catIdentifier;
              const IconComp = getCategoryIcon(cat.icon);

              return (
                <button
                  key={cat._id || cat.slug || cat.name}
                  onClick={() => handleSelectCategory(catIdentifier)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${isActive
                    ? 'bg-[#4A151B] text-[#D4AF37] shadow-md scale-105 border border-[#D4AF37]/60 ring-2 ring-[#D4AF37]/30'
                    : 'bg-white text-[#4A151B] border border-[#D4AF37]/25 hover:bg-[#F3ECE1] hover:border-[#D4AF37]/50'
                    }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                  {/* {typeof cat.designCount === 'number' && cat.designCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        : 'bg-[#F3ECE1] text-[#8A3324]'
                        }`}
                    >
                      {cat.designCount}
                    </span>
                  )} */}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-Category Filter (Shows when a category is selected & has subcategories) */}
        {selectedCategory !== 'all' && availableSubcategories.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#F3ECE1]/70 border border-[#D4AF37]/30 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#611C23] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#8A3324]" />
                {activeCategoryObj?.name || 'Category'} Sub-Styles:
              </span>
              {subcategoriesLoading && (
                <span className="text-[10px] text-[#8A3324] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating...
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => handleSelectSubcategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedSubcategory === 'all'
                  ? 'bg-[#8A3324] text-white shadow-sm font-bold'
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
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${isSubActive
                      ? 'bg-[#8A3324] text-white shadow-sm font-bold scale-[1.02]'
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
          </div>
        )}

        {/* Results Count & Reset Header */}
        <div className="flex items-center justify-between pt-1 text-xs text-[#8A3324]">


          {(selectedCategory !== 'all' || selectedSubcategory !== 'all' || searchInput) && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-[#8A3324] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-full border border-[#D4AF37]/30 shadow-xs"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {designsLoading && designs.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#D4AF37]/20 p-4 space-y-3 animate-pulse"
            >
              <div className="h-72 sm:h-80 bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-gray-200 rounded-xl flex-1" />
                <div className="h-8 bg-gray-200 rounded-xl flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : designsError && filteredDesigns.length === 0 ? (
        /* Error State */
        <div className="text-center py-16 bg-white rounded-3xl border border-red-200 p-8 space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-royal text-xl font-bold text-[#4A151B]">
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
        <div className="text-center py-16 bg-white rounded-3xl border border-[#D4AF37]/20 p-8 space-y-4 max-w-md mx-auto shadow-sm">
          <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto animate-pulse" />
          <h3 className="font-royal text-xl font-bold text-[#4A151B]">
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
        /* Designs Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDesigns.map((design) => {
            const isLiked =
              favorites.includes(design.id) || favorites.includes(design._id);

            return (
              <div
                key={design.id || design._id}
                className="group bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section - Displays Complete Uncropped Image */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#1A0A0C] flex items-center justify-center">
                  {/* Blurred Backdrop */}
                  <img
                    src={design.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                  />

                  {/* Main Uncropped Foreground Image */}
                  <img
                    src={design.image}
                    alt={design.title}
                    className="relative z-1 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        design.fallbackImage ||
                        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 opacity-80 pointer-events-none z-2" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1A0D0E]/85 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 shadow">
                        {design.style || design.categoryName || 'Bridal Henna'}
                      </span>
                      {design.subcategoryName && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#4A151B]/85 backdrop-blur-md text-white/90 border border-white/20">
                          {design.subcategoryName}
                        </span>
                      )}
                    </div>

                    {/* Favorite / Mood Board Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(design);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer ${isLiked
                        ? 'bg-[#E63946] text-white shadow-md'
                        : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                      aria-label="Add to favorites"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  {/* Hover Quick View Trigger */}
                  <button
                    onClick={() => onSelectDesign && onSelectDesign(design)}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer text-white text-xs font-bold gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-[#D4AF37]" />
                    <span>Quick Zoom &amp; Details</span>
                  </button>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 z-10">
                    <span className="flex items-center gap-1 font-medium bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      {design.duration}
                    </span>
                    <span className="font-royal font-bold text-[#D4AF37] bg-black/70 px-2 py-0.5 rounded backdrop-blur-xs">
                      {design.priceEstimate}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => navigate(`/designs/${design.slug || design._id || design.id}`)}
                      className="font-royal text-base font-bold text-[#4A151B] hover:text-[#8A3324] transition-colors cursor-pointer line-clamp-1"
                    >
                      {design.title}
                    </h3>
                    <p className="text-xs text-[#4A151B]/75 line-clamp-2 leading-relaxed">
                      {design.description}
                    </p>

                    {/* Motifs preview */}
                    {design.motifs && design.motifs.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {design.motifs.slice(0, 3).map((motif, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-[#F3ECE1] text-[10px] text-[#611C23] font-medium"
                          >
                            {motif}
                          </span>
                        ))}
                        {design.motifs.length > 3 && (
                          <span className="text-[10px] text-[#8A3324] font-bold self-center">
                            +{design.motifs.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/designs/${design.slug || design._id || design.id}`)}
                      className="flex-1 py-2 rounded-xl bg-white border border-[#D4AF37]/40 text-[#4A151B] hover:bg-[#F3ECE1] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3 h-3 text-[#8A3324]" />
                    </button>
                    {/* <button
                      onClick={() => onBookDesign && onBookDesign(design)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-[#FAF6F0] hover:brightness-110 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>Book Look</span>
                    </button> */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
