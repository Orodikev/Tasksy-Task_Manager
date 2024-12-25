const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body; // Extract user data from request
    const user = new User({ username, email, password }); // Create a new user
    await user.save(); // Save the user in the database
    res.status(201).json({ message: 'User registered successfully' }); // Respond with success
  } catch (err) {
    res.status(400).json({ error: err.message }); // Respond with error
  }
};

// Log in an existing user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }); // Find user by email
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password); // Verify password
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    res.status(200).json({ token }); // Respond with token
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

