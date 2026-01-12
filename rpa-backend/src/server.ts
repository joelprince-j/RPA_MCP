import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes under /api prefix
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 RPA Backend API Server                ║
╠════════════════════════════════════════════╣
║   📍 URL: http://localhost:${PORT}         ║
║   📊 Health: http://localhost:${PORT}/health ║
╠════════════════════════════════════════════╣
║   Available Endpoints:                     ║
║   POST   /api/site-maps                    ║
║   GET    /api/site-maps                    ║
║   GET    /api/site-maps/:id                ║
║   POST   /api/flows                        ║
║   GET    /api/flows                        ║
║   GET    /api/flows/:id                    ║
║   POST   /api/executions                   ║
║   GET    /api/executions/:id               ║
╚════════════════════════════════════════════╝
  `);
});
