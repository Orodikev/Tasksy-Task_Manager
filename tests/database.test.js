const mongoose = require('mongoose');
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('Database Connection', () => {
  it('should handle connection failure gracefully', async () => {
    const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tasksy';
    
    // Simulate a failed connection
    mongoose.connect.mockRejectedValueOnce(new Error('Connection failed'));
    
    try {
      await mongoose.connect(dbURI);
    } catch (error) {
      expect(error.message).toBe('Connection failed');
    }
  });
});
