import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const FALLBACK_FILE = path.join(DATA_DIR, 'local_entries.json');

// Global status flag for database health
export const dbStatus = {
  isConnected: false,
  mode: 'disconnected', // 'mongodb' | 'local_fallback' | 'disconnected'
  uri: '',
  error: null
};

// Fallback in-memory and file-persisted storage
export const localStore = {
  entries: [],

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(FALLBACK_FILE)) {
        const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8');
        this.entries = JSON.parse(raw);
      } else {
        this.entries = [];
        fs.writeFileSync(FALLBACK_FILE, JSON.stringify(this.entries, null, 2));
      }
    } catch (err) {
      console.error('[Fallback Store] Error initializing local fallback file:', err.message);
      this.entries = [];
    }
  },

  save(entry) {
    const newEntry = {
      _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...entry,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.entries.unshift(newEntry);
    this.persist();
    return newEntry;
  },

  getAll() {
    return [...this.entries];
  },

  deleteById(id) {
    const initialLen = this.entries.length;
    this.entries = this.entries.filter(e => e._id !== id);
    if (this.entries.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  },

  clearAll() {
    this.entries = [];
    this.persist();
    return true;
  },

  persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(this.entries, null, 2));
    } catch (err) {
      console.error('[Fallback Store] Failed to persist local entries:', err.message);
    }
  }
};

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flames_game';
  dbStatus.uri = uri;

  // Initialize fallback storage immediately
  localStore.init();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500 // Don't hang if Mongo isn't running
    });
    dbStatus.isConnected = true;
    dbStatus.mode = 'mongodb';
    dbStatus.error = null;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (err) {
    dbStatus.isConnected = false;
    dbStatus.mode = 'local_fallback';
    dbStatus.error = err.message;
    console.warn('\n============================================================');
    console.warn('[Notice] MongoDB connection could not be established:');
    console.warn(`         ${err.message}`);
    console.warn('[Notice] Running in RESILIENT LOCAL FALLBACK MODE.');
    console.warn('         All FLAMES games and Admin dashboard operations');
    console.warn('         will persist to server/data/local_entries.json seamlessly.');
    console.warn('         To connect to MongoDB, supply a working MONGODB_URI in server/.env');
    console.warn('============================================================\n');
  }
};
