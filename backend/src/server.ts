import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import menuRoutes from './routes/menu';
import tableRoutes from './routes/tables';
import waiterRoutes from './routes/waiters';
import crmRoutes from './routes/crm';

const app = express();

// Middleware
const allowedOrigins = config.frontendUrl === '*'
    ? '*'
    : [config.frontendUrl, 'http://localhost:5173', 'http://localhost:4173', 'http://restuarantsiparistakip.com.tr', 'https://restuarantsiparistakip.com.tr'].filter(Boolean);

app.use(cors({
    origin: allowedOrigins === '*' ? '*' : (origin, callback) => {
        if (!origin || (allowedOrigins as string[]).includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all for now, tighten in production
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/waiters', waiterRoutes);
app.use('/api/v1/crm', crmRoutes);

// Error handling
app.use(errorHandler);

// Start server (only when not in Vercel serverless)
if (!process.env.VERCEL) {
    const PORT = config.port;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 Environment: ${config.nodeEnv}`);
        console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
    });
}

export default app;
