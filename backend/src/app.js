require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const clinicRoutes = require('./routes/clinics');
const referralRoutes = require('./routes/referrals');
const waitListRoutes = require('../routes/waitlist')
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://new-scriptish.vercel.app',
      'https://scriptishrxnewmark.onrender.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean); // Remove undefined values

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/clinics', clinicRoutes);
app.use('/v1/referrals', referralRoutes);
app.use('/v1/waitlist',waitListRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
