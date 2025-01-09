const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

// Extend timeout globally for this file
jest.setTimeout(30000); // 30 seconds

let authToken;
let taskId;

// Connect to database and setup user before tests
beforeAll(async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Mock user creation and authentication for the tests
    const user = await User.create({
      email: 'test@example.com',
      password: 'password',
    });

    authToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  } catch (err) {
    console.error('Error during beforeAll setup:', err);
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

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('task');
    taskId = response.body.task._id; // Store task ID for future use
  });

  // Test for fetching all tasks
  it('should fetch all tasks', async () => {
    const response = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${authToken}`);

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

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Task deleted successfully');
  });
});

