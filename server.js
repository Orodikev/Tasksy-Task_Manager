const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/auth');
dotenv.config();

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Authorization middleware (Make sure this is applied to protected routes)
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Use user ID from decoded token
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);

    // Exit process only if it's not a test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw err; // In test environments, allow Jest to handle it
    }
  });

// Routes
app.use('/tasks', authMiddleware, taskRoutes); // Apply authMiddleware here
app.use('/auth', userRoutes); // Assuming your auth routes are in a separate file

// Export app for testing
module.exports = app;

