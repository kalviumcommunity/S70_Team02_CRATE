import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import repoRoutes from './routes/repo.routes';
import mlRoutes from './routes/ml.routes';
import authRoutes from './routes/auth.routes';

const app = express();

// 1. CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local dev environment
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Request Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'CRATE Backend REST API Server',
    githubTokenConfigured: Boolean(env.GITHUB_TOKEN),
    oauthConfigured: Boolean(env.GITHUB_CLIENT_ID),
    timestamp: new Date().toISOString(),
  });
});

// 4. API Routes Registration
app.use('/api', repoRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/auth', authRoutes);

// 5. 404 Handler Middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 6. Global Error Handling Middleware (400, 500)
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', err.stack || err.message);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: statusCode === 400 ? 'Bad Request' : 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.',
  });
});

// Start Server
if (require.main === module) {
  const port = parseInt(env.PORT, 10) || 3000;
  app.listen(port, () => {
    console.log(`🚀 CRATE Backend REST API server is running on http://localhost:${port}`);
    console.log(`📊 Dashboard API: http://localhost:${port}/api/dashboard?repo=expressjs/express`);
    console.log(`🤖 Predict API: POST http://localhost:${port}/api/ml/predict`);
    console.log(`🔐 Auth API: GET http://localhost:${port}/api/auth/github`);
  });
}

export default app;
