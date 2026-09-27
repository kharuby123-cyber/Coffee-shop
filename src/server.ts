import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Import routes
import authRouter from './routes/auth';
import ordersRouter from './routes/orders';
import feedbacksRouter from './routes/feedbacks';

// Initialize DB on startup
import getDb from './database';
getDb();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/feedbacks', feedbacksRouter);

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'CoffeeShop API',
    timestamp: new Date().toISOString()
  });
});

// ─── Serve Static Files (frontend) ─────────────────────────────────────────
// Serve the existing static HTML/CSS/JS files
const staticDir = path.join(__dirname, '..');
app.use(express.static(staticDir, {
  index: 'index.html',
  // Exclude source/build directories
  dotfiles: 'ignore'
}));

// Fallback: serve index.html for unknown routes (SPA-friendly)
app.get('/{*path}', (req, res) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ success: false, message: 'API endpoint không tồn tại.' });
    return;
  }
  // Map known page routes
  const pageName = path.basename(req.path);
  if (pageName.endsWith('.html')) {
    res.sendFile(path.join(staticDir, pageName));
  } else {
    res.sendFile(path.join(staticDir, 'index.html'));
  }
});

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi hệ thống. Vui lòng thử lại sau.'
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║        ☕  CoffeeShop Server Running!         ║');
  console.log('╠═══════════════════════════════════════════════╣');
  console.log(`║  Frontend: http://localhost:${PORT}              ║`);
  console.log(`║  API:      http://localhost:${PORT}/api/health   ║`);
  console.log('╚═══════════════════════════════════════════════╝');
  console.log('');
});

export default app;
