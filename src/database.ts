import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'coffeeshop.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    -- Users table (customers who register/login)
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name   TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      phone       TEXT,
      password    TEXT    NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'customer',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    -- Orders table
    CREATE TABLE IF NOT EXISTS orders (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER,
      customer_name TEXT    NOT NULL,
      customer_email TEXT   NOT NULL,
      customer_phone TEXT   NOT NULL,
      delivery_address TEXT,
      note          TEXT,
      status        TEXT    NOT NULL DEFAULT 'pending',
      total_amount  REAL    NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Order items table
    CREATE TABLE IF NOT EXISTS order_items (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id    INTEGER NOT NULL,
      product_id  INTEGER NOT NULL,
      product_name TEXT   NOT NULL,
      product_image TEXT,
      quantity    INTEGER NOT NULL DEFAULT 1,
      unit_price  REAL    NOT NULL,
      subtotal    REAL    NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- Feedbacks table (from contact form)
    CREATE TABLE IF NOT EXISTS feedbacks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      phone       TEXT,
      topic       TEXT,
      rating      INTEGER NOT NULL DEFAULT 5,
      message     TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log('[DB] Schema initialized at:', DB_PATH);
}

export default getDb;
