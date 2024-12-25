const mongoose = require('mongoose');

// Define the Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Category name is mandatory
  },
  user: {
    type: mongoose.Schema.Types.ObjectId, // Links category to a user
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Category', categorySchema);

