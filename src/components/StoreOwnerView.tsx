import React, { useState, useEffect } from 'react';
import { Store, Star, Users, MapPin, Mail, Calendar, AlertCircle, Loader2, Search } from 'lucide-react';
import { OwnerStoreData, OwnerReview } from '../types';
import { api } from '../api';
import { StarRating } from './StarRating';

export const StoreOwnerView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stores, setStores] = useState<OwnerStoreData[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getOwnerDashboard();
      setHasStore(data.hasStore);
      if (data.stores && data.stores.length > 0) {
        setStores(data.stores);
      } else if (data.message) {
        setErrorMessage(data.message);
      }
    } catch (err: any) {
      console.error('Owner dashboard error:', err);
      setErrorMessage(err.message || 'Failed to load store owner dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#111] rounded-3xl border border-white/10 shadow-2xl">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider text-white/40">Loading store analytics...</p>
      </div>
    );
  }

  if (!hasStore || stores.length === 0) {
    return (
      <div className="bg-[#111] rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight text-white">No Store Assigned</h2>
        <p className="text-xs text-white/60 mt-2 mb-6">
          {errorMessage || 'Your account is registered as a Store Owner, but an Administrator has not yet linked a store to your profile.'}
        </p>
        <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 text-xs text-white/60 text-left space-y-1.5 font-medium">
          <p className="font-bold text-white uppercase text-[10px] tracking-wider">How to activate your store dashboard:</p>
          <p>1. Switch to an Administrator profile using the Demo Persona switcher in the top bar.</p>
          <p>2. Open the "Stores Management" tab and add or edit a store.</p>
          <p>3. Select your user profile as the designated Store Owner.</p>
        </div>
      </div>
    );
  }

  const currentStore = stores[selectedStoreIndex] || stores[0];

  // Filter reviews by search (user name, email, address) and rating
  const filteredRatings = (currentStore.ratings || []).filter((r: OwnerReview) => {
    const matchesSearch =
      r.userName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      r.userAddress.toLowerCase().includes(userSearchQuery.toLowerCase());

    const matchesRating = ratingFilter === 'all' || r.rating === parseInt(ratingFilter, 10);
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-8">
      {/* Store Selector (if owner has multiple stores) */}
      {stores.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {stores.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setSelectedStoreIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                idx === selectedStoreIndex
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Main KPI Card */}
      <div className="bg-[#111] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-2">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              Store Owner Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase">
              {currentStore.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-white/30" />
                {currentStore.address}
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-white/30" />
                {currentStore.email}
              </span>
            </div>
          </div>

          {/* Average Rating Highlight Badge */}
          <div className="flex items-center gap-5 bg-[#161616] p-5 sm:p-6 rounded-2xl border border-amber-500/30 shrink-0 shadow-lg">
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono leading-none">
                {currentStore.averageRating ? currentStore.averageRating.toFixed(1) : '0.0'}
              </span>
              <p className="text-[10px] font-black text-amber-400/80 mt-1 uppercase tracking-[0.2em]">
                Average Score
              </p>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div>
              <div className="flex items-center gap-1 mb-1">
                <StarRating value={Math.round(currentStore.averageRating)} readOnly size="sm" />
              </div>
              <p className="text-xs font-bold text-white/60">
                Based on <span className="font-black text-white font-mono">{currentStore.totalRatings}</span> {currentStore.totalRatings === 1 ? 'rating' : 'ratings'}
              </p>
            </div>
          </div>
        </div>

        {/* Rating Breakdown & Distribution */}
        <div className="mt-6">
          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] mb-3">
            Ratings Distribution
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = currentStore.distribution?.[stars] || 0;
              const percent = currentStore.totalRatings > 0 ? (count / currentStore.totalRatings) * 100 : 0;
              return (
                <div key={stars} className="bg-[#161616] rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs font-black text-white mb-2.5">
                    <span className="flex items-center gap-1">
                      {stars} <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    </span>
                    <span className="font-mono text-white/70">{count}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* List of Users who have submitted ratings for their store */}
      <div className="bg-[#111] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Customer Evaluations</h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 text-white px-2.5 py-0.5 rounded-full border border-white/15">
                {filteredRatings.length}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Detailed list of platform customers who rated this store
            </p>
          </div>

          {/* Filters within ratings list */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="owner-user-search-input"
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user or address..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/15 bg-[#161616] text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-white/50"
              />
            </div>
            <select
              id="owner-rating-filter-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-white/15 text-xs font-bold uppercase tracking-wider text-white bg-[#161616] focus:outline-none focus:border-white/50"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>
        </div>

        {/* Ratings Table / Cards */}
        {filteredRatings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">No user ratings match your search criteria</p>
            <p className="text-xs text-white/40 mt-1">
              {currentStore.ratings.length === 0
                ? 'No users have submitted ratings for this store yet.'
                : 'Try clearing your search query or star filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/15 text-white/40 font-black uppercase tracking-[0.2em] text-[10px]">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">User Address</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRatings.map((item) => (
                  <tr key={item.ratingId} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-4 px-4 font-bold text-white text-xs">
                      {item.userName}
                    </td>
                    <td className="py-4 px-4 text-white/60 font-mono text-[11px]">
                      {item.userEmail}
                    </td>
                    <td className="py-4 px-4 text-white/50 max-w-xs truncate" title={item.userAddress}>
                      {item.userAddress}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-amber-400/20 border border-amber-400/30 text-amber-300 font-black text-xs flex items-center justify-center font-mono">
                          {item.rating}
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= item.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-white/10 fill-white/5'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white/40 whitespace-nowrap font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-white/30" />
                        <span>{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
