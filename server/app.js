import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();
const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS || '').split(','),
]
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ''));

const corsOptions = {
  origin(origin, callback) {
    if (
      !origin ||
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin.trim().replace(/\/+$/, ''))
    ) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin '${origin}' not permitted by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'DocuKeep API',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

export default app;
