import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'store_rating.sqlite');

export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  address: string;
  role: 'admin' | 'normal' | 'store_owner';
  created_at: string;
}

export interface StoreRow {
  id: string;
  name: string;
  email: string;
  address: string;
  owner_id: string | null;
  created_at: string;
}

export interface RatingRow {
  id: string;
  user_id: string;
  store_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  initTables(dbInstance);
  await seedInitialData(dbInstance);
  saveDb();

  return dbInstance;
}

export function queryAll<T = any>(sql: string, params: any[] = []): T[] {
  if (!dbInstance) throw new Error('Database not initialized');
  const stmt = dbInstance.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as unknown as T);
  }
  stmt.free();
  return results;
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const all = queryAll<T>(sql, params);
  return all.length > 0 ? all[0] : null;
}

export function execute(sql: string, params: any[] = []): void {
  if (!dbInstance) throw new Error('Database not initialized');
  dbInstance.run(sql, params);
  saveDb();
}

export function saveDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

function initTables(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      address TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'normal', 'store_owner')),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      owner_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY(owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      store_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(user_id, store_id),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(store_id) REFERENCES stores(id)
    );
  `);
}

async function seedInitialData(db: Database) {
  const check = db.exec("SELECT COUNT(*) as count FROM users;");
  const count = check.length > 0 && check[0].values.length > 0 ? (check[0].values[0][0] as number) : 0;
  if (count > 0) return;

  console.log('Seeding initial data for Store Rating Platform...');

  const adminPass = await bcrypt.hash('AdminPass123!', 10);
  const owner1Pass = await bcrypt.hash('OwnerPass123!', 10);
  const owner2Pass = await bcrypt.hash('OwnerPass123!', 10);
  const user1Pass = await bcrypt.hash('UserPass123!', 10);
  const user2Pass = await bcrypt.hash('UserPass123!', 10);
  const user3Pass = await bcrypt.hash('UserPass123!', 10);

  // Names MUST adhere to 20-60 character validation!
  // 'Supervisor Administrator Alpha' = 29 chars
  // 'Christopher Wallace Proprietor' = 30 chars
  // 'Eleanor Vance Retail Director' = 29 chars
  // 'Alexandra Montgomery Smith' = 26 chars
  // 'Jonathan Sterling Patterson' = 27 chars
  // 'Beatrice Holloway Jenkins' = 25 chars

  const adminId = 'usr_admin_001';
  const owner1Id = 'usr_owner_001';
  const owner2Id = 'usr_owner_002';
  const user1Id = 'usr_norm_001';
  const user2Id = 'usr_norm_002';
  const user3Id = 'usr_norm_003';

  const now = new Date().toISOString();

  // Insert users
  const users = [
    [adminId, 'Supervisor Administrator Alpha', 'admin.supervisor@ratingsystem.com', adminPass, '1000 Central Corporate Boulevard, Suite 500, Tech City, TC 94103', 'admin', now],
    [owner1Id, 'Christopher Wallace Proprietor', 'chris.wallace.retail@storehub.com', owner1Pass, '452 West Lexington Avenue, Ground Floor, New York, NY 10017', 'store_owner', now],
    [owner2Id, 'Eleanor Vance Retail Director', 'eleanor.vance.shops@storehub.com', owner2Pass, '883 Market Promenade Plaza, Retail Wing B, San Francisco, CA 94105', 'store_owner', now],
    [user1Id, 'Alexandra Montgomery Smith', 'alexandra.smith@personamail.org', user1Pass, '742 Evergreen Terrace Residential Court, Springfield, IL 62704', 'normal', now],
    [user2Id, 'Jonathan Sterling Patterson', 'jonathan.patterson@domainmail.net', user2Pass, '1204 Blossom Hill Road, Apt 4B, San Jose, CA 95123', 'normal', now],
    [user3Id, 'Beatrice Holloway Jenkins', 'beatrice.jenkins@clientpost.com', user3Pass, '310 Ocean Boulevard, Penthouse 12, Miami Beach, FL 33139', 'normal', now]
  ];

  for (const u of users) {
    db.run(
      `INSERT INTO users (id, name, email, password_hash, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      u
    );
  }

  // Insert stores
  const store1Id = 'str_001';
  const store2Id = 'str_002';
  const store3Id = 'str_003';

  const stores = [
    [store1Id, 'Apex Artisan Grocery and Provisions', 'contact@apexartisangrocery.com', '452 West Lexington Avenue, Ground Floor, New York, NY 10017', owner1Id, now],
    [store2Id, 'Beacon Books & Specialty Roasters', 'hello@beaconbooksroasters.com', '883 Market Promenade Plaza, Retail Wing B, San Francisco, CA 94105', owner2Id, now],
    [store3Id, 'Cascade Mountain Outdoor Gear & Apparel', 'support@cascadeoutdoorshop.com', '1249 Pine Valley Highway, Suite 10, Seattle, WA 98101', null, now]
  ];

  for (const s of stores) {
    db.run(
      `INSERT INTO stores (id, name, email, address, owner_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      s
    );
  }

  // Insert sample ratings (1 to 5)
  const ratings = [
    ['rat_001', user1Id, store1Id, 5, '2026-03-01T10:15:00.000Z', '2026-03-01T10:15:00.000Z'],
    ['rat_002', user2Id, store1Id, 4, '2026-03-02T14:30:00.000Z', '2026-03-02T14:30:00.000Z'],
    ['rat_003', user3Id, store1Id, 5, '2026-03-03T09:00:00.000Z', '2026-03-03T09:00:00.000Z'],
    ['rat_004', user1Id, store2Id, 4, '2026-03-01T11:20:00.000Z', '2026-03-01T11:20:00.000Z'],
    ['rat_005', user2Id, store2Id, 3, '2026-03-02T16:45:00.000Z', '2026-03-02T16:45:00.000Z'],
    ['rat_006', user3Id, store3Id, 5, '2026-03-04T08:15:00.000Z', '2026-03-04T08:15:00.000Z']
  ];

  for (const r of ratings) {
    db.run(
      `INSERT INTO ratings (id, user_id, store_id, rating, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      r
    );
  }

  console.log('Database seeded successfully!');
}
