import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes';
import machineRoutes from './routes/machines.routes';
import bookingRoutes from './routes/bookings.routes';
import estimateRoutes from './routes/estimates.routes';
import notificationRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const orig = res.json.bind(res);
    res.json = (body: any) => {
      console.log(`[${req.method}] ${req.path} → ${res.statusCode}`);
      return orig(body);
    };
    next();
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/estimates', estimateRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
