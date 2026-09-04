import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Sparkles, Check, Loader2, RefreshCw } from 'lucide-react';
import { Store } from '../types';
import { api } from '../api';
import { StarRating } from './StarRating';

export const NormalUserView: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingRating, setIsSubmittingRating] = useState<string | null>(null);
  const [activeEditingStoreId, setActiveEditingStoreId] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<number>(5);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'reviews'>('name');

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      const data = await api.getStores({ search: searchQuery });
      setStores(data);
    } catch (err: any) {
      console.error('Failed to load stores:', err);
      setNotification({ message: err.message || 'Failed to load stores', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRatingSubmit = async (storeId: string, rating: number) => {
    setIsSubmittingRating(storeId);
    try {
      const res = await api.submitRating({ storeId, rating });
      setNotification({
        message: `${res.message}: ${rating} Star${rating > 1 ? 's' : ''}`,
        type: 'success',
      });
      // Update local store state immediately
      setStores((prev) =>
        prev.map((s) => {
          if (s.id === storeId) {
            return {
              ...s,
              overallRating: res.storeStats.overallRating,
              totalRatings: res.storeStats.totalRatings,
              userSubmittedRating: rating,
              userRatingUpdatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );
      setActiveEditingStoreId(null);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification({ message: err.message || 'Could not submit rating', type: 'error' });
    } finally {
      setIsSubmittingRating(null);
    }
  };

  const sortedStores = [...stores].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.overallRating || 0) - (a.overallRating || 0);
    }
    if (sortBy === 'reviews') {
      return b.totalRatings - a.totalRatings;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-8">
      {/* Top Banner / Heading */}
      <div className="bg-[#111] rounded-3xl p-6 sm:p-8 border-l-4 border-blue-500 border-t border-r border-b border-white/10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-blue-500/15 text-blue-400 border border-blue-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Registered Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase">
            Discover & Rate Stores
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/60 font-medium">
            Browse verified platform stores, inspect community evaluations, and submit or update your honest ratings.
          </p>
        </div>
      </div>

      {/* Global Action Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold uppercase tracking-wider shadow-lg ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-[10px] font-black underline hover:opacity-75 cursor-pointer ml-4 uppercase"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Sorting Toolbar */}
      <div className="bg-[#111] rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col md:flex-row gap-3 md:items-center justify-between shadow-xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-white/30 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="store-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stores by Name or Physical Address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/15 bg-[#161616] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 whitespace-nowrap">Sort:</span>
          <select
            id="store-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl border border-white/15 text-xs font-bold uppercase tracking-wider text-white bg-[#161616] focus:outline-none focus:border-white/50"
          >
            <option value="name">Store Name (A-Z)</option>
            <option value="rating">Highest Rated</option>
            <option value="reviews">Most Reviewed</option>
          </select>
          <button
            id="store-refresh-btn"
            onClick={fetchStores}
            title="Refresh store listings"
            className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-white/15 bg-white/5"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stores List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#111] rounded-3xl border border-white/10 shadow-2xl">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
          <p className="text-xs font-bold uppercase tracking-wider text-white/40">Loading registered stores...</p>
        </div>
      ) : sortedStores.length === 0 ? (
        <div className="bg-[#111] rounded-3xl p-12 text-center border border-white/10 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white">No stores found</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto mt-1">
            {searchQuery
              ? `No stores matched "${searchQuery}". Try searching with a different store name or street address.`
              : 'There are currently no stores registered on the platform.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedStores.map((store) => {
            const hasUserRating = store.userSubmittedRating !== null && store.userSubmittedRating !== undefined;
            const isEditingThisStore = activeEditingStoreId === store.id;

            return (
              <div
                key={store.id}
                id={`store-card-${store.id}`}
                className="bg-[#111] rounded-3xl p-6 border border-white/10 hover:border-white/25 shadow-2xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Line: Store Name & Overall Rating Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-black text-white tracking-tight leading-snug">
                      {store.name}
                    </h3>
                    <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-xl shrink-0">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black text-white">
                        {store.overallRating !== null ? store.overallRating.toFixed(1) : 'New'}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        ({store.totalRatings})
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-white/50 text-xs mb-5">
                    <MapPin className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{store.address}</span>
                  </div>
                </div>

                {/* Rating Interaction Section */}
                <div className="pt-4 border-t border-white/10">
                  <div className="bg-[#161616] rounded-2xl p-4 border border-white/10">
                    {/* Status Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                        Your Rating
                      </span>
                      {hasUserRating && !isEditingThisStore && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/15 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                          Rated: {store.userSubmittedRating} ★
                        </span>
                      )}
                      {!hasUserRating && !isEditingThisStore && (
                        <span className="text-[10px] uppercase font-bold text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                          Not rated yet
                        </span>
                      )}
                    </div>

                    {/* If currently modifying rating or submitting for the first time */}
                    {isEditingThisStore ? (
                      <div className="space-y-4 pt-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-white/60">Choose Score:</span>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setTempRating(num)}
                                className={`w-8 h-8 rounded-lg font-black text-xs transition-all cursor-pointer ${
                                  tempRating === num
                                    ? 'bg-white text-black shadow-md scale-105'
                                    : 'bg-white/5 hover:bg-white/15 text-white/70 border border-white/10'
                                }`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
                          <button
                            type="button"
                            id={`cancel-edit-rating-${store.id}`}
                            onClick={() => setActiveEditingStoreId(null)}
                            className="px-3 py-1.5 text-xs font-bold text-white/60 hover:text-white bg-white/5 rounded-xl border border-white/10 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            id={`save-rating-${store.id}`}
                            disabled={isSubmittingRating === store.id}
                            onClick={() => handleRatingSubmit(store.id, tempRating)}
                            className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md cursor-pointer"
                          >
                            {isSubmittingRating === store.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                                <span>Saving...</span>
                              </>
                            ) : (
                              'Confirm Rating'
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display rating status and quick actions */
                      <div className="flex items-center justify-between gap-2">
                        {hasUserRating ? (
                          <>
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/30 text-amber-300 font-black text-xs flex items-center justify-center">
                                {store.userSubmittedRating}
                              </div>
                              <StarRating value={store.userSubmittedRating!} readOnly size="sm" />
                            </div>
                            <button
                              type="button"
                              id={`modify-rating-btn-${store.id}`}
                              onClick={() => {
                                setTempRating(store.userSubmittedRating || 5);
                                setActiveEditingStoreId(store.id);
                              }}
                              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all cursor-pointer"
                            >
                              Modify Rating
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5">
                              <StarRating
                                value={null}
                                onChange={(r) => handleRatingSubmit(store.id, r)}
                                size="sm"
                              />
                            </div>
                            <button
                              type="button"
                              id={`submit-rating-btn-${store.id}`}
                              onClick={() => {
                                setTempRating(5);
                                setActiveEditingStoreId(store.id);
                              }}
                              className="px-4 py-2 text-xs font-black uppercase tracking-wider text-black bg-white hover:bg-neutral-200 rounded-xl transition-all shadow-md cursor-pointer"
                            >
                              Submit Rating
                            </button>
                          </>
                        )}
                      </div>
                    )}
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
