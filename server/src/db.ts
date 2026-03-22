import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'memomed.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

type Migration = {
  id: string;
  sql: string;
};

const migrations: Migration[] = [
  {
    id: '001_create_tables',
    sql: `
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        run_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS treatments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        source TEXT NOT NULL,
        woo_product_id TEXT,
        woo_product_image TEXT,
        frequency_per_day INTEGER NOT NULL,
        units_per_intake INTEGER NOT NULL,
        unit_label TEXT NOT NULL,
        meal_condition TEXT NOT NULL,
        times TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        notes TEXT,
        package_size INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS intake_logs (
        id TEXT PRIMARY KEY,
        treatment_id TEXT NOT NULL,
        scheduled_at TEXT NOT NULL,
        status TEXT NOT NULL,
        confirmed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT,
        image TEXT,
        price REAL NOT NULL,
        currency TEXT NOT NULL,
        units_per_package INTEGER,
        unit_label TEXT,
        category TEXT,
        description TEXT,
        url TEXT,
        units_per_intake INTEGER,
        frequency_per_day INTEGER,
        days_remaining INTEGER,
        total_days INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_treatments_user ON treatments(user_id);
      CREATE INDEX IF NOT EXISTS idx_intake_logs_treatment ON intake_logs(treatment_id);
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    `,
  },
];

export const runMigrations = () => {
  db.exec('BEGIN');
  try {
    db.exec(`CREATE TABLE IF NOT EXISTS migrations (id TEXT PRIMARY KEY, run_at TEXT NOT NULL)`);
    const rows = db.prepare('SELECT id FROM migrations').all() as { id: string }[];
    const seen = new Set<string>(rows.map((row) => row.id));
    for (const migration of migrations) {
      if (seen.has(migration.id)) continue;
      db.exec(migration.sql);
      db.prepare("INSERT INTO migrations (id, run_at) VALUES (?, datetime('now'))").run(migration.id);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
};
