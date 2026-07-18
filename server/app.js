import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', businessRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
