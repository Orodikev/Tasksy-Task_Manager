const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Route to create a task
router.post('/', async (req, res) => {
  const { title, description, dueDate } = req.body;

  try {
    // Extract user from request (assumes user is added by auth middleware)
    const user = req.user?._id;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const newTask = new Task({ title, description, dueDate, user });
    await newTask.save();
    res.status(201).json({ task: newTask });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to fetch all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }); // Fetch tasks for the authenticated user
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to fetch a task by its ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findOne({ _id: id, user: req.user._id }); // Ensure the task belongs to the user
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to update a task by its ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate } = req.body;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id }, // Ensure the task belongs to the user
      { title, description, dueDate },
      { new: true }
    );
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ task: updatedTask });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Route to delete a task by its ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

