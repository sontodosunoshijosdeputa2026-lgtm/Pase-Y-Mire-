import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import gamesRoutes from './routes/games.js';

dotenv.config();

const app = express();

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));

// Parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/games', authMiddleware, gamesRoutes);

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎰 Casino As corriendo en puerto ${PORT}`);
});

export default app;
                            
