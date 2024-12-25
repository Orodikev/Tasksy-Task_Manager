const express = require("express");
const router = express.Router();
const Task = require("../models/task"); // Task model
const sendEmail = require("../services/emailService"); // Email service
const authMiddleware = require("../middleware/auth"); // Authorization middleware

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /tasks
 * @desc Get all tasks for the authenticated user
 */
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route POST /tasks
 * @desc Create a new task
 */
router.post("/", async (req, res) => {
  const { title, description, dueDate } = req.body;

  try {
    const newTask = new Task({
      userId: req.user.id,
      title,
      description,
      dueDate,
    });

    const savedTask = await newTask.save();

    // Send email notification to the user
    await sendEmail(
      req.user.email,
      "New Task Created",
      `Your task "${savedTask.title}" has been successfully created and is due on ${savedTask.dueDate}.`
    );

    res.status(201).json(savedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route PUT /tasks/:id
 * @desc Update a specific task
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, completed } = req.body;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title, description, dueDate, completed },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Send email notification for task updates
    await sendEmail(
      req.user.email,
      "Task Updated",
      `Your task "${updatedTask.title}" has been updated.`
    );

    if (completed) {
      // Additional email for task completion
      await sendEmail(
        req.user.email,
        "Task Completed",
        `Congratulations! You have completed the task "${updatedTask.title}".`
      );
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route DELETE /tasks/:id
 * @desc Delete a specific task
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Send email notification for task deletion
    await sendEmail(
      req.user.email,
      "Task Deleted",
      `The task "${deletedTask.title}" has been successfully deleted.`
    );

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;

