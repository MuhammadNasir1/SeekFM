import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import { syncDatabase } from './models/index.js';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api/auth', authRoutes);

// Start the server and sync database
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await syncDatabase();
  console.log(`Server running on port ${PORT}`);
});
