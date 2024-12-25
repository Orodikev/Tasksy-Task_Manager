const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User schema with fields for user data
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // This field is mandatory
    unique: true, // No two users can have the same username
    trim: true, // Removes extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Middleware to hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Skip if password hasn't changed
  const salt = await bcrypt.genSalt(10); // Generate salt for hashing
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  next();
});

module.exports = mongoose.model('User', userSchema); // Export the model

