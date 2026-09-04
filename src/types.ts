export type UserRole = 'admin' | 'normal' | 'store_owner';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt?: string;
  store?: {
    id: string;
    name: string;
    avgRating: number | null;
    totalRatings: number;
  } | null;
  storeOwnerRating?: number | string | null;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  createdAt?: string;
  overallRating: number | null;
  totalRatings: number;
  userSubmittedRating?: number | null;
  userRatingUpdatedAt?: string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface OwnerReview {
  ratingId: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
  userAddress: string;
}

export interface OwnerStoreData {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  totalRatings: number;
  distribution: Record<number, number>;
  ratings: OwnerReview[];
}

export interface AdminStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  platformAverageRating: number;
  roleDistribution: Array<{ role: string; count: number }>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
