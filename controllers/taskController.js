const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({ ...req.body, user: req.user.id }); // Add task details and user ID
    await task.save(); // Save the task to the database
    res.status(201).json(task); // Respond with the created task
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }); // Find tasks for the logged-in user
    res.status(200).json(tasks); // Respond with tasks
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

