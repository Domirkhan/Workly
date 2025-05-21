import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// ... existing imports ...

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Обновленные настройки CORS
app.use(cors({
  origin: ['http://89.46.33.244', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'dist')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/timesheet', timesheetRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/bonuses', bonusRoutes);

// Handle SPA routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
});

// ... rest of the code ...