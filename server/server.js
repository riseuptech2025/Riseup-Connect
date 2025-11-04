// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const questionRoutes = require('./routes/questionRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Add this
const imageRoutes = require('./routes/imageRoutes');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Add this line
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    // Set CORS headers for static files
    res.set('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:5173');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/upload', uploadRoutes); // Add this
app.use('/api/images', imageRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});