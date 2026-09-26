import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, dbStatus } from './config/db.js';
import flamesRoutes from './routes/flamesRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Setup environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (with intelligent local fallback)
connectDB();

// Parse configured allowed client origins
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// CORS configuration supporting local dev, Render, and Vercel deployments
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, Render health checks, Postman, curl)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');

    // Allow localhost/127.0.0.1 on any port
    if (
      cleanOrigin.startsWith('http://localhost') ||
      cleanOrigin.startsWith('http://127.0.0.1')
    ) {
      return callback(null, true);
    }

    // Allow if CLIENT_ORIGIN is '*' or not specified
    if (allowedOrigins.length === 0 || allowedOrigins.includes('*')) {
      return callback(null, true);
    }

    // Allow if explicitly configured in CLIENT_ORIGIN
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow any Vercel deployment (*.vercel.app)
    try {
      const hostname = new URL(cleanOrigin).hostname;
      if (hostname.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch {
      // Ignore URL parse errors
    }

    // Permissive fallback so requests aren't silently dropped
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Service root endpoint (useful for Render health/browser testing)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'FLAMES Game API Server',
    version: '1.0.0',
    documentation: 'Welcome to FLAMES Game Backend! See /api/health for system status.',
    endpoints: {
      health: '/api/health',
      playGame: 'POST /api/flames/play',
      publicStats: 'GET /api/flames/stats',
      adminAuth: 'POST /api/admin/auth',
      adminEntries: 'GET /api/admin/entries'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'FLAMES Game API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      mode: dbStatus.mode,
      connected: dbStatus.isConnected
    }
  });
});

// Mount modular routes
app.use('/api/flames', flamesRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error Catch]:', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error occurred.'
  });
});

// Start Express server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🔥 FLAMES Game API Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️  Admin API ready with key protection`);
  console.log(`💾 Database Mode: ${dbStatus.mode.toUpperCase()}`);
  console.log(`======================================================\n`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
