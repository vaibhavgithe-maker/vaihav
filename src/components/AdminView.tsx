import React, { useState, useEffect } from 'react';
import {
  Users,
  Store as StoreIcon,
  Star,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  Eye,
  RefreshCw,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { AdminStats, User, Store } from '../types';
import { api } from '../api';
import { AddUserModal } from './AddUserModal';
import { AddStoreModal } from './AddStoreModal';
import { UserDetailsModal } from './UserDetailsModal';
import { StarRating } from './StarRating';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userNameFilter, setUserNameFilter] = useState('');
  const [userEmailFilter, setUserEmailFilter] = useState('');
  const [userAddressFilter, setUserAddressFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  // Stores State
  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storeNameFilter, setStoreNameFilter] = useState('');
  const [storeEmailFilter, setStoreEmailFilter] = useState('');
  const [storeAddressFilter, setStoreAddressFilter] = useState('');

  // Modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.getAdminUsers({
        name: userNameFilter,
        email: userEmailFilter,
        address: userAddressFilter,
        role: userRoleFilter,
      });
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const data = await api.getAdminStores({
        name: storeNameFilter,
        email: storeEmailFilter,
        address: storeAddressFilter,
      });
      setStores(data);
    } catch (err) {
      console.error('Failed to fetch admin stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [userNameFilter, userEmailFilter, userAddressFilter, userRoleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStores();
    }, 200);
    return () => clearTimeout(timer);
  }, [storeNameFilter, storeEmailFilter, storeAddressFilter]);

  const handleRefreshAll = () => {
    fetchStats();
    fetchUsers();
    fetchStores();
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-purple-500/15 text-purple-400 border border-purple-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            System Administrator Control
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white uppercase">
            Platform Overview
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1 font-medium">
            Monitor real-time metrics, register businesses, and manage ecosystem credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="admin-refresh-all-btn"
            onClick={handleRefreshAll}
            className="p-2.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 rounded-full transition-all cursor-pointer"
            title="Refresh all data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="admin-add-store-btn"
            onClick={() => setIsAddStoreOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-amber-400/40 text-amber-300 hover:bg-amber-400/10 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Store</span>
          </button>
          <button
            id="admin-add-user-btn"
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-full text-[11px] font-black uppercase tracking-widest transition-all shadow-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Dashboard Metrics (Total Users, Total Stores, Total Ratings, Platform Avg) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="bg-[#111] p-6 rounded-2xl border-l-4 border-purple-500 border-t border-r border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">
              Total Active Users
            </p>
            <div className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
              {loadingStats ? <Loader2 className="w-8 h-8 animate-spin text-purple-400" /> : stats?.totalUsers ?? 0}
            </div>
            <p className="text-xs text-purple-400 mt-2 font-mono flex items-center gap-1">
              <span>● Normal, Admins & Owners</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Stores */}
        <div className="bg-[#111] p-6 rounded-2xl border-l-4 border-amber-500 border-t border-r border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">
              Registered Stores
            </p>
            <div className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
              {loadingStats ? <Loader2 className="w-8 h-8 animate-spin text-amber-400" /> : stats?.totalStores ?? 0}
            </div>
            <p className="text-xs text-amber-400 mt-2 font-mono">
              ● Verified Directory Stores
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <StoreIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Total Ratings */}
        <div className="bg-[#111] p-6 rounded-2xl border-l-4 border-emerald-500 border-t border-r border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">
              Submitted Ratings
            </p>
            <div className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
              {loadingStats ? <Loader2 className="w-8 h-8 animate-spin text-emerald-400" /> : stats?.totalRatings ?? 0}
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-mono">
              ● Community Reviews Logged
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Star className="w-6 h-6 fill-emerald-400 text-emerald-400" />
          </div>
        </div>

        {/* Platform Average Rating */}
        <div className="bg-[#111] p-6 rounded-2xl border-l-4 border-blue-500 border-t border-r border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-1">
              Platform Rating Avg
            </p>
            <div className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
              {loadingStats ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
              ) : stats?.platformAverageRating ? (
                `${stats.platformAverageRating} ★`
              ) : (
                '0.0 ★'
              )}
            </div>
            <p className="text-xs text-blue-400 mt-2 font-mono">
              ● 1.0 to 5.0 Rating Scale
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Users List vs Stores List */}
      <div className="bg-[#111] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="flex border-b border-white/10 bg-white/[0.02] p-2 gap-2">
          <button
            id="admin-tab-users"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({users.length})</span>
          </button>
          <button
            id="admin-tab-stores"
            onClick={() => setActiveTab('stores')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              activeTab === 'stores'
                ? 'bg-white text-black shadow-lg'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <StoreIcon className="w-4 h-4" />
            <span>Store Listings ({stores.length})</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* USERS MANAGEMENT TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            {/* Filters: Name, Email, Address, Role */}
            <div className="bg-[#161616] p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-purple-400" /> Filter Directory Users
                </span>
                {(userNameFilter || userEmailFilter || userAddressFilter || userRoleFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setUserNameFilter('');
                      setUserEmailFilter('');
                      setUserAddressFilter('');
                      setUserRoleFilter('all');
                    }}
                    className="text-[10px] uppercase tracking-wider text-purple-400 hover:text-purple-300 font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Filter by Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Filter by Name</label>
                  <input
                    id="filter-user-name-input"
                    type="text"
                    value={userNameFilter}
                    onChange={(e) => setUserNameFilter(e.target.value)}
                    placeholder="Search name..."
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-[#0d0d0d] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
                  />
                </div>

                {/* Filter by Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Filter by Email</label>
                  <input
                    id="filter-user-email-input"
                    type="text"
                    value={userEmailFilter}
                    onChange={(e) => setUserEmailFilter(e.target.value)}
                    placeholder="Search email..."
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-[#0d0d0d] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
                  />
                </div>

                {/* Filter by Address */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Filter by Address</label>
                  <input
                    id="filter-user-address-input"
                    type="text"
                    value={userAddressFilter}
                    onChange={(e) => setUserAddressFilter(e.target.value)}
                    placeholder="Search address..."
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-[#0d0d0d] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
                  />
                </div>

                {/* Filter by Role */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Filter by Role</label>
                  <select
                    id="filter-user-role-select"
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-[#0d0d0d] text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 font-medium"
                  >
                    <option value="all">All Roles</option>
                    <option value="normal">Normal User</option>
                    <option value="store_owner">Store Owner</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User List Table */}
            {loadingUsers ? (
              <div className="py-16 text-center text-white/40">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-purple-400" />
                <span className="text-xs uppercase tracking-wider font-bold">Querying users database...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/15 rounded-2xl text-xs text-white/40 uppercase tracking-wider font-bold">
                No users matched your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Store Owner Rating</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => {
                      const isOwner = u.role === 'store_owner';
                      return (
                        <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-4 px-4 font-bold text-white max-w-[180px] truncate" title={u.name}>
                            {u.name}
                          </td>
                          <td className="py-4 px-4 text-white/60 font-mono max-w-[180px] truncate" title={u.email}>
                            {u.email}
                          </td>
                          <td className="py-4 px-4 text-white/60 max-w-xs truncate" title={u.address}>
                            {u.address}
                          </td>
                          <td className="py-4 px-4">
                            {u.role === 'admin' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                <ShieldCheck className="w-3 h-3" /> Admin
                              </span>
                            )}
                            {u.role === 'store_owner' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <StoreIcon className="w-3 h-3" /> Owner
                              </span>
                            )}
                            {u.role === 'normal' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                <UserCheck className="w-3 h-3" /> Normal
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isOwner ? (
                              u.store ? (
                                <div className="flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                  <span className="font-bold text-white">
                                    {u.store.avgRating !== null ? `${u.store.avgRating} ★` : 'New'}
                                  </span>
                                  <span className="text-[10px] text-white/40">
                                    ({u.store.totalRatings})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-white/30 italic text-[11px]">Unassigned</span>
                              )
                            ) : (
                              <span className="text-white/20">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              id={`view-user-details-btn-${u.id}`}
                              onClick={() => setSelectedUserForDetails(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STORES MANAGEMENT TAB */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'stores' && (
          <div className="p-6 space-y-6">
            {/* Filters: Name, Email, Address */}
            <div className="bg-[#161616] p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter Stores Directory
                </span>
                {(storeNameFilter || storeEmailFilter || storeAddressFilter) && (
                  <button
                    onClick={() => {
                      setStoreNameFilter('');
                      setStoreEmailFilter('');
                      setStoreAddressFilter('');
                    }}
                    className="text-[10px] uppercase tracking-wider text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Filter by Name */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Filter by Store Name</label>
                  <input
                    id="filter-store-name-input"
                    type="text"
                    value={storeNameFilter}
                    onChange={(e) => setStoreNameFilter(e.target.value)}
                    placeholder="Search store name..."
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-[#0d0d0d] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
                  />
                </div>

                {/* Filter by Email */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Filter by Email</label>
                  <input
                    id="filter-store-email-input"
                    type="text"
                    value={storeEmailFilter}
                    onChange={(e) => setStoreEmailFilter(e.target.value)}
                    placeholder="Search store email..."
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-[#0d0d0d] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
                  />
                </div>

                {/* Filter by Address */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">Filter by Address</label>
                  <input
                    id="filter-store-address-input"
                    type="text"
                    value={storeAddressFilter}
                    onChange={(e) => setStoreAddressFilter(e.target.value)}
                    placeholder="Search store address..."
                    className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-[#0d0d0d] text-white placeholder:text-white/25 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50"
                  />
                </div>
              </div>
            </div>

            {/* Stores List Table */}
            {loadingStores ? (
              <div className="py-16 text-center text-white/40">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
                <span className="text-xs uppercase tracking-wider font-bold">Loading store listings...</span>
              </div>
            ) : stores.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-white/15 rounded-2xl text-xs text-white/40 uppercase tracking-wider font-bold">
                No stores found matching filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                      <th className="py-3 px-4">Store Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Address</th>
                      <th className="py-3 px-4">Assigned Owner</th>
                      <th className="py-3 px-4">Overall Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stores.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="py-4 px-4 font-bold text-white max-w-[200px] truncate" title={s.name}>
                          {s.name}
                        </td>
                        <td className="py-4 px-4 text-white/60 font-mono">
                          {s.email}
                        </td>
                        <td className="py-4 px-4 text-white/60 max-w-xs truncate" title={s.address}>
                          {s.address}
                        </td>
                        <td className="py-4 px-4 text-white">
                          {s.owner ? (
                            <span className="font-bold text-white">
                              {s.owner.name}
                            </span>
                          ) : (
                            <span className="text-white/30 italic">None assigned</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-white">
                              {s.overallRating !== null ? `${s.overallRating} ★` : 'New'}
                            </span>
                            <span className="text-[10px] text-white/40">
                              ({s.totalRatings} ratings)
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onUserAdded={() => {
          fetchUsers();
          fetchStats();
        }}
      />

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={isAddStoreOpen}
        onClose={() => setIsAddStoreOpen(false)}
        onStoreAdded={() => {
          fetchStores();
          fetchStats();
        }}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={selectedUserForDetails !== null}
        user={selectedUserForDetails}
        onClose={() => setSelectedUserForDetails(null)}
      />
    </div>
  );
};
