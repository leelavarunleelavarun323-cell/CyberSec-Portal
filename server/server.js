/* ═══════════════════════════════════════════════════════════════
   server.js — Main Express Application
   CyberSec Portal Backend API

   Features:
   ─ Helmet for HTTP header security
   ─ CORS for cross-origin frontend access
   ─ JSON body parsing with size limit
   ─ Modular route mounting
   ─ Global error handler
   ─ Graceful shutdown with DB cleanup
   ═══════════════════════════════════════════════════════════════ */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const { initializeDatabase, closeDatabase } = require('./database');
const createArticlesRouter = require('./routes/articles');
const createCheatsheetsRouter = require('./routes/cheatsheets');
const createTerminalRouter = require('./routes/terminal');

/* ─── Configuration ─────────────────────────────────────────── */
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

/**
 * Bootstrap the application.
 * sql.js requires async initialization, so we wrap startup in an
 * async function.
 */
async function startServer() {
  /* ─── Initialize Database ───────────────────────────────────── */
  const db = await initializeDatabase();

  /* ─── Initialize Express App ────────────────────────────────── */
  const app = express();

  /* ─────────────────────────────────────────────────────────────
     MIDDLEWARE
     ───────────────────────────────────────────────────────────── */

  // 1. Helmet — Sets various HTTP security headers
  //    (Content-Security-Policy, X-Frame-Options, etc.)
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP to allow inline styles in frontend
  }));

  // 2. CORS — Allow cross-origin requests from the frontend
  app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Preflight cache: 24 hours
  }));

  // 3. JSON body parser with 1MB size limit (prevents payload floods)
  app.use(express.json({ limit: '1mb' }));

  // 4. Request logging (simple middleware)
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
  });

  /* ─────────────────────────────────────────────────────────────
     STATIC FILES (serve the frontend)
     ───────────────────────────────────────────────────────────── */
  app.use(express.static(path.join(__dirname, '..'), {
    extensions: ['html'],
    index: 'index.html',
  }));

  /* ─────────────────────────────────────────────────────────────
     API ROUTES
     ───────────────────────────────────────────────────────────── */

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      success: true,
      message: 'CyberSec Portal API is running',
      version: '1.0.0',
      uptime: `${Math.floor(process.uptime())}s`,
    });
  });

  // Mount route modules
  app.use('/api/articles', createArticlesRouter(db));
  app.use('/api/cheatsheets', createCheatsheetsRouter(db));
  app.use('/api/terminal', createTerminalRouter());

  /* ─────────────────────────────────────────────────────────────
     404 HANDLER — Catch unmatched API routes
     ───────────────────────────────────────────────────────────── */
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  });

  /* ─────────────────────────────────────────────────────────────
     GLOBAL ERROR HANDLER
     ───────────────────────────────────────────────────────────── */
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[Error]', err.stack || err.message);

    // Don't leak stack traces in production
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

    res.status(err.status || 500).json({
      success: false,
      error: message,
    });
  });

  /* ─────────────────────────────────────────────────────────────
     START SERVER
     ───────────────────────────────────────────────────────────── */
  const server = app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║       CyberSec Portal API — Server Running      ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Local:    http://localhost:${PORT}                ║`);
    console.log(`║  API:      http://localhost:${PORT}/api/health     ║`);
    console.log('║  Frontend: Served from parent directory          ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
  });

  /* ─────────────────────────────────────────────────────────────
     GRACEFUL SHUTDOWN — Close DB on process termination
     ───────────────────────────────────────────────────────────── */
  function gracefulShutdown(signal) {
    console.log(`\n[${signal}] Shutting down gracefully...`);
    server.close(() => {
      closeDatabase();
      console.log('[Server] Closed. Database connection released.');
      process.exit(0);
    });
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

/* ─── Launch ──────────────────────────────────────────────────── */
startServer().catch(err => {
  console.error('[Fatal] Failed to start server:', err);
  process.exit(1);
});
