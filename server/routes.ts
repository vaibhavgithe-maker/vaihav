import express, { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { queryAll, queryOne, execute, UserRow, StoreRow, RatingRow } from './db';
import { authenticateToken, requireRole, generateToken, AuthRequest } from './auth';
import { validateName, validateAddress, validatePassword, validateEmail, validateRating } from '../src/validation';

export const apiRouter = Router();

// ==========================================
// PUBLIC & DEMO ENDPOINTS
// ==========================================

apiRouter.get('/demo-accounts', (req, res) => {
  res.json({
    admin: {
      email: 'admin.supervisor@ratingsystem.com',
      password: 'AdminPass123!',
      role: 'admin',
      name: 'Supervisor Administrator Alpha'
    },
    storeOwner: {
      email: 'chris.wallace.retail@storehub.com',
      password: 'OwnerPass123!',
      role: 'store_owner',
      name: 'Christopher Wallace Proprietor'
    },
    normalUser: {
      email: 'alexandra.smith@personamail.org',
      password: 'UserPass123!',
      role: 'normal',
      name: 'Alexandra Montgomery Smith'
    }
  });
});

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

// Register Normal User
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ error: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) {
      return res.status(400).json({ error: addressCheck.message });
    }

    const existingUser = queryOne<UserRow>('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email address already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + crypto.randomUUID();
    const createdAt = new Date().toISOString();

    execute(
      `INSERT INTO users (id, name, email, password_hash, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.trim().toLowerCase(), passwordHash, address.trim(), 'normal', createdAt]
    );

    const user = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
      role: 'normal' as const
    };

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// Login
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = queryOne<UserRow>('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    const token = generateToken(authUser);
    res.json({ user: authUser, token });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Current Authenticated User Profile
apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  let storeInfo = null;
  if (req.user.role === 'store_owner') {
    const store = queryOne<StoreRow>('SELECT * FROM stores WHERE owner_id = ?', [req.user.id]);
    if (store) {
      const stats = queryOne<{ avgRating: number; totalRatings: number }>(
        `SELECT ROUND(AVG(rating), 1) as avgRating, COUNT(id) as totalRatings FROM ratings WHERE store_id = ?`,
        [store.id]
      );
      storeInfo = {
        ...store,
        avgRating: stats?.avgRating || 0,
        totalRatings: stats?.totalRatings || 0
      };
    }
  }

  res.json({ user: req.user, store: storeInfo });
});

// Update Password (available to Normal User, Store Owner, System Admin)
apiRouter.post('/auth/update-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    const user = queryOne<UserRow>('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Internal server error while updating password' });
  }
});

// ==========================================
// SYSTEM ADMINISTRATOR ENDPOINTS
// ==========================================

// Administrator Dashboard Stats
apiRouter.get('/admin/stats', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const userCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');
    const storeCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM stores');
    const ratingCount = queryOne<{ count: number }>('SELECT COUNT(*) as count FROM ratings');
    const avgPlatformRating = queryOne<{ avg: number }>('SELECT ROUND(AVG(rating), 2) as avg FROM ratings');

    const roleCounts = queryAll<{ role: string; count: number }>(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    res.json({
      totalUsers: userCount?.count || 0,
      totalStores: storeCount?.count || 0,
      totalRatings: ratingCount?.count || 0,
      platformAverageRating: avgPlatformRating?.avg || 0,
      roleDistribution: roleCounts
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin statistics' });
  }
});

// Administrator: List Users with Filters (Name, Email, Address, Role)
apiRouter.get('/admin/users', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { name, email, address, role, search } = req.query as Record<string, string>;

    let sql = `
      SELECT 
        u.id, u.name, u.email, u.address, u.role, u.created_at,
        s.id as store_id, s.name as store_name,
        (SELECT ROUND(AVG(r.rating), 1) FROM ratings r WHERE r.store_id = s.id) as store_avg_rating,
        (SELECT COUNT(r.id) FROM ratings r WHERE r.store_id = s.id) as store_total_ratings
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (name) {
      sql += ' AND LOWER(u.name) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }

    if (email) {
      sql += ' AND LOWER(u.email) LIKE ?';
      params.push(`%${email.toLowerCase()}%`);
    }

    if (address) {
      sql += ' AND LOWER(u.address) LIKE ?';
      params.push(`%${address.toLowerCase()}%`);
    }

    if (role && role !== 'all') {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    if (search) {
      sql += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.address) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' ORDER BY u.created_at DESC';

    const rawUsers = queryAll(sql, params);
    
    // Format response ensuring Store Owner ratings are explicitly exposed
    const users = rawUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      address: u.address,
      role: u.role,
      createdAt: u.created_at,
      store: u.store_id ? {
        id: u.store_id,
        name: u.store_name,
        avgRating: u.store_avg_rating !== null ? Number(u.store_avg_rating) : null,
        totalRatings: Number(u.store_total_ratings) || 0
      } : null,
      storeOwnerRating: u.role === 'store_owner' ? (u.store_avg_rating !== null ? Number(u.store_avg_rating) : 'No ratings yet') : null
    }));

    res.json(users);
  } catch (err: any) {
    console.error('Admin users list error:', err);
    res.status(500).json({ error: 'Failed to retrieve user list' });
  }
});

// Administrator: Add New User (Admin, Normal, or Store Owner)
apiRouter.post('/admin/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const allowedRoles = ['admin', 'normal', 'store_owner'];
    const assignedRole = allowedRoles.includes(role) ? role : 'normal';

    const nameCheck = validateName(name);
    if (!nameCheck.valid) {
      return res.status(400).json({ error: nameCheck.message });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) {
      return res.status(400).json({ error: addressCheck.message });
    }

    const existingUser = queryOne<UserRow>('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email address already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = 'usr_' + crypto.randomUUID();
    const createdAt = new Date().toISOString();

    execute(
      `INSERT INTO users (id, name, email, password_hash, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.trim().toLowerCase(), passwordHash, address.trim(), assignedRole, createdAt]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        role: assignedRole,
        createdAt
      }
    });
  } catch (err: any) {
    console.error('Admin create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Administrator: List Stores with Filters (Name, Email, Address) & Overall Rating
apiRouter.get('/admin/stores', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { name, email, address, search } = req.query as Record<string, string>;

    let sql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.created_at, s.owner_id,
        u.name as owner_name, u.email as owner_email,
        ROUND(AVG(r.rating), 1) as avg_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (name) {
      sql += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }

    if (email) {
      sql += ' AND LOWER(s.email) LIKE ?';
      params.push(`%${email.toLowerCase()}%`);
    }

    if (address) {
      sql += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.toLowerCase()}%`);
    }

    if (search) {
      sql += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.email) LIKE ? OR LOWER(s.address) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' GROUP BY s.id, s.name, s.email, s.address, s.created_at, s.owner_id, u.name, u.email ORDER BY s.created_at DESC';

    const stores = queryAll(sql, params).map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      createdAt: s.created_at,
      owner: s.owner_id ? {
        id: s.owner_id,
        name: s.owner_name,
        email: s.owner_email
      } : null,
      rating: s.avg_rating !== null ? Number(s.avg_rating) : null,
      totalRatings: Number(s.total_ratings) || 0
    }));

    res.json(stores);
  } catch (err: any) {
    console.error('Admin stores list error:', err);
    res.status(500).json({ error: 'Failed to retrieve store list' });
  }
});

// Administrator: Add New Store
apiRouter.post('/admin/stores', authenticateToken, requireRole(['admin']), (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Store name is required' });
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({ error: emailCheck.message });
    }

    const addressCheck = validateAddress(address);
    if (!addressCheck.valid) {
      return res.status(400).json({ error: addressCheck.message });
    }

    let resolvedOwnerId: string | null = null;
    if (ownerId) {
      const owner = queryOne<UserRow>('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (owner) {
        resolvedOwnerId = owner.id;
        if (owner.role !== 'store_owner') {
          execute("UPDATE users SET role = 'store_owner' WHERE id = ?", [owner.id]);
        }
      }
    }

    const storeId = 'str_' + crypto.randomUUID();
    const createdAt = new Date().toISOString();

    execute(
      `INSERT INTO stores (id, name, email, address, owner_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [storeId, name.trim(), email.trim().toLowerCase(), address.trim(), resolvedOwnerId, createdAt]
    );

    res.status(201).json({
      message: 'Store added successfully',
      store: {
        id: storeId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerId: resolvedOwnerId,
        createdAt
      }
    });
  } catch (err: any) {
    console.error('Admin create store error:', err);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

// ==========================================
// NORMAL USER & STORE LISTINGS ENDPOINTS
// ==========================================

// Get All Stores for Normal Users with Search by Name & Address + Current User's Rating
apiRouter.get('/stores', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { search, name, address } = req.query as Record<string, string>;
    const currentUserId = req.user?.id;

    let sql = `
      SELECT 
        s.id, s.name, s.email, s.address, s.created_at,
        ROUND(AVG(r.rating), 1) as avg_rating,
        COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (name) {
      sql += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.toLowerCase()}%`);
    }

    if (address) {
      sql += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.toLowerCase()}%`);
    }

    if (search) {
      sql += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.address) LIKE ?)';
      params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
    }

    sql += ' GROUP BY s.id, s.name, s.email, s.address, s.created_at ORDER BY s.name ASC';

    const stores = queryAll(sql, params);

    // Fetch ratings submitted by current user
    let userRatingsMap: Record<string, { rating: number; updatedAt: string }> = {};
    if (currentUserId) {
      const userRatings = queryAll<RatingRow>(
        'SELECT store_id, rating, updated_at FROM ratings WHERE user_id = ?',
        [currentUserId]
      );
      for (const ur of userRatings) {
        userRatingsMap[ur.store_id] = {
          rating: ur.rating,
          updatedAt: ur.updated_at
        };
      }
    }

    const enriched = stores.map((s: any) => {
      const ur = userRatingsMap[s.id];
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        createdAt: s.created_at,
        overallRating: s.avg_rating !== null ? Number(s.avg_rating) : null,
        totalRatings: Number(s.total_ratings) || 0,
        userSubmittedRating: ur ? ur.rating : null,
        userRatingUpdatedAt: ur ? ur.updatedAt : null
      };
    });

    res.json(enriched);
  } catch (err: any) {
    console.error('Fetch stores error:', err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Normal User: Submit or Modify Rating (1 to 5)
apiRouter.post('/ratings', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (!storeId) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const ratingNum = Number(rating);
    const ratingCheck = validateRating(ratingNum);
    if (!ratingCheck.valid) {
      return res.status(400).json({ error: ratingCheck.message });
    }

    // Verify store exists
    const store = queryOne<StoreRow>('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const now = new Date().toISOString();
    const existingRating = queryOne<RatingRow>(
      'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    let isModification = false;
    if (existingRating) {
      isModification = true;
      execute(
        'UPDATE ratings SET rating = ?, updated_at = ? WHERE id = ?',
        [ratingNum, now, existingRating.id]
      );
    } else {
      const ratingId = 'rat_' + crypto.randomUUID();
      execute(
        'INSERT INTO ratings (id, user_id, store_id, rating, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [ratingId, userId, storeId, ratingNum, now, now]
      );
    }

    // Return updated store stats
    const stats = queryOne<{ avg: number; count: number }>(
      'SELECT ROUND(AVG(rating), 1) as avg, COUNT(id) as count FROM ratings WHERE store_id = ?',
      [storeId]
    );

    res.json({
      message: isModification ? 'Rating updated successfully' : 'Rating submitted successfully',
      isModification,
      submittedRating: ratingNum,
      storeStats: {
        overallRating: stats?.avg !== null ? Number(stats?.avg) : null,
        totalRatings: Number(stats?.count) || 0
      }
    });
  } catch (err: any) {
    console.error('Submit rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// ==========================================
// STORE OWNER DASHBOARD ENDPOINTS
// ==========================================

apiRouter.get('/owner/dashboard', authenticateToken, requireRole(['store_owner']), (req: AuthRequest, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    // Find stores owned by this user
    const stores = queryAll<StoreRow>('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);

    if (stores.length === 0) {
      return res.json({
        hasStore: false,
        message: 'No store is currently assigned to your account. Please contact an Administrator to assign your store.',
        stores: []
      });
    }

    const storeSummaries = stores.map(store => {
      const stats = queryOne<{ avg: number; count: number }>(
        'SELECT ROUND(AVG(rating), 1) as avg, COUNT(id) as count FROM ratings WHERE store_id = ?',
        [store.id]
      );

      // List of users who have submitted ratings for their store
      const ratingsWithUsers = queryAll<{
        ratingId: string;
        rating: number;
        createdAt: string;
        updatedAt: string;
        userName: string;
        userEmail: string;
        userAddress: string;
      }>(
        `SELECT 
          r.id as ratingId,
          r.rating,
          r.created_at as createdAt,
          r.updated_at as updatedAt,
          u.name as userName,
          u.email as userEmail,
          u.address as userAddress
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY r.updated_at DESC`,
        [store.id]
      );

      // Rating breakdown distribution (5 stars, 4 stars, etc.)
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratingsWithUsers.forEach(r => {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      });

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: stats?.avg !== null ? Number(stats?.avg) : 0,
        totalRatings: Number(stats?.count) || 0,
        distribution,
        ratings: ratingsWithUsers
      };
    });

    res.json({
      hasStore: true,
      stores: storeSummaries
    });
  } catch (err: any) {
    console.error('Store owner dashboard error:', err);
    res.status(500).json({ error: 'Failed to retrieve store owner dashboard' });
  }
});
