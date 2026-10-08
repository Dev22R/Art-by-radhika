import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Heart,
  Clock,
  Crown,
  Eye,
  Check,
  Filter,
  X,
} from 'lucide-react';
import { MEHNDI_CATEGORIES, DESIGNS_DATA } from '../data/mehndiData';

export const DesignsPage = ({ onSelectDesign, onBookDesign, favorites, onToggleLike }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState('all');

  const filteredDesigns = useMemo(() => {
    return DESIGNS_DATA.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.motifs.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesComplexity =
        selectedComplexity === 'all' ||
        item.complexity.toLowerCase().includes(selectedComplexity.toLowerCase());

      return matchesCategory && matchesSearch && matchesComplexity;
    });
  }, [activeCategory, searchQuery, selectedComplexity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-bold text-[#8A3324] tracking-widest block">
          Portfolio &amp; Lookbook
        </span>
        <h1 className="font-royal text-3xl sm:text-5xl font-bold text-[#4A151B]">
          The Royal Henna Gallery
        </h1>
        <p className="text-xs sm:text-sm text-[#4A151B]/80 leading-relaxed">
          Explore over bespoke bridal heirloom motifs, Arabic negative-space vines, and intricate sacred mandalas.
        </p>
      </div>

      {/* Search & Complexity Filters */}
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A3324] absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by motif (e.g. Lotus, Portrait, Jharokha, Peacock, Arabic)..."
            className="w-full pl-11 pr-10 py-3 rounded-full border border-[#D4AF37]/40 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#8A3324] shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 p-0.5 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {MEHNDI_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#4A151B] text-[#D4AF37] shadow-md scale-105 border border-[#D4AF37]/50'
                    : 'bg-white text-[#4A151B] border border-[#D4AF37]/25 hover:bg-[#F3ECE1]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Complexity Quick Filter */}
        <div className="flex items-center justify-between text-xs text-[#8A3324]">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold">Density:</span>
            {['all', 'Royal Heavy', 'Medium Chic', 'Minimal'].map((comp) => (
              <button
                key={comp}
                onClick={() => setSelectedComplexity(comp)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedComplexity === comp
                    ? 'bg-[#8A3324] text-white font-bold'
                    : 'bg-white/80 text-[#4A151B] hover:bg-[#F3ECE1]'
                }`}
              >
                {comp === 'all' ? 'All Densities' : comp}
              </button>
            ))}
          </div>

          <span className="font-medium hidden sm:inline">
            Showing {filteredDesigns.length} master designs
          </span>
        </div>
      </div>

      {/* Designs Grid */}
      {filteredDesigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#D4AF37]/20 p-8 space-y-4">
          <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto animate-pulse" />
          <h3 className="font-royal text-xl font-bold text-[#4A151B]">
            No matching designs found
          </h3>
          <p className="text-xs sm:text-sm text-[#4A151B]/70 max-w-sm mx-auto">
            Try adjusting your search terms or select another category filter.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setSelectedComplexity('all');
            }}
            className="px-5 py-2 rounded-full bg-[#4A151B] text-white text-xs font-semibold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDesigns.map((design) => {
            const isLiked = favorites.includes(design.id);

            return (
              <div
                key={design.id}
                className="group bg-[#FFFDF9] rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#2A0C0E]">
                  <img
                    src={design.image}
                    alt={design.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = design.fallbackImage;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1A0D0E]/80 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 shadow">
                      {design.style}
                    </span>

                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(design.id);
                      }}
                      className={`p-2 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer ${
                        isLiked
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
                    onClick={() => onSelectDesign(design)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer text-white text-xs font-bold gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-[#D4AF37]" />
                    <span>Quick Zoom &amp; Details</span>
                  </button>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90">
                    <span className="flex items-center gap-1 font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      {design.duration}
                    </span>
                    <span className="font-royal font-bold text-[#D4AF37] bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      {design.priceEstimate}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => onSelectDesign(design)}
                      className="font-royal text-base font-bold text-[#4A151B] hover:text-[#8A3324] transition-colors cursor-pointer line-clamp-1"
                    >
                      {design.title}
                    </h3>
                    <p className="text-xs text-[#4A151B]/75 line-clamp-2 leading-relaxed">
                      {design.description}
                    </p>

                    {/* Motifs preview */}
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
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center gap-2">
                    <button
                      onClick={() => onSelectDesign(design)}
                      className="flex-1 py-2 rounded-xl bg-white border border-[#D4AF37]/40 text-[#4A151B] hover:bg-[#F3ECE1] text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Specs
                    </button>
                    <button
                      onClick={() => onBookDesign(design)}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#4A151B] to-[#8A3324] text-[#FAF6F0] hover:brightness-110 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>Book Look</span>
                    </button>
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
