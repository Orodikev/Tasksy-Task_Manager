const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const User = require('../models/User');
const Task = require('../models/Task');

// Extend timeout globally for this file
jest.setTimeout(30000); // 30 seconds

let authToken;
let taskId;

// Connect to database and setup user before tests
beforeAll(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);

    // Clear collections
    await User.deleteMany();
    await Task.deleteMany();

    // Create mock user and generate auth token
    const user = new User({ email: 'test@example.com', password: 'password' });
    await user.save();

    authToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Ensure JWT_SECRET is set
  } catch (err) {
    console.error('Error during beforeAll setup:', err);
    throw err; // Ensure tests fail if setup fails
  }
});

// Disconnect from database after tests
afterAll(async () => {
  try {
    if (mongoose.connection) {
      await mongoose.disconnect();
    }
  } catch (err) {
    console.error('Error during afterAll teardown:', err);
  }
});

describe('Task API Endpoints', () => {
  // Test for creating a task
  it('should create a task', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test description',
      dueDate: '2025-01-08',
    };

    const response = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send(taskData);

    // Debugging log in case of failure
    if (response.status !== 201) {
      console.error('Create Task Error:', response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('task');
    taskId = response.body.task._id; // Store task ID for future use
  });

  // Test for fetching all tasks
  it('should fetch all tasks', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    // Debugging log in case of failure
    if (response.status !== 200) {
      console.error('Fetch Tasks Error:', response.body);
    }

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test for updating a task
  it('should update a task', async () => {
    // Ensure task exists
    expect(taskId).toBeDefined();

    const updatedData = {
      title: 'Updated Task Title',
      description: 'Updated description',
    };

    const response = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedData);

    // Debugging log in case of failure
    if (response.status !== 200) {
      console.error('Update Task Error:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('task');
    expect(response.body.task.title).toBe(updatedData.title);
  });

  // Test for deleting a task
  it('should delete a task', async () => {
    // Ensure task exists
    expect(taskId).toBeDefined();

    const response = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Debugging log in case of failure
    if (response.status !== 200) {
      console.error('Delete Task Error:', response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task deleted successfully');
  });
});

