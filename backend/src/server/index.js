import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import routes from '../routes/index.js';
import ErrorHandler from '../middleware/error.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost', 'http://localhost:5173'];
  
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

// 3. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // FIX: 15 menit (15 * 60 * 1000)
  max: 500, // Dinaikkan ke 200 agar user tidak mudah kena limit saat navigasi halaman
  message: {
    status: 'fail',
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Terapkan limit ini ke semua rute yang berawalan /api
app.use('/api', apiLimiter);

// 4. Built-in Middleware (Parsing JSON body)
app.use(express.json());

// 5. Routes Utama
app.use(routes);

// 6. Error Handler (Harus selalu berada di urutan paling bawah!)
app.use(ErrorHandler);

export default app;
