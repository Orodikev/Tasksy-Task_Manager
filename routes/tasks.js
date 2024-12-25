const express = require('express');
const router = express.Router();

// Sample route for tasks
router.get('/', (req, res) => {
  res.status(200).send({ message: 'Tasks API is working!' });
});

module.exports = router;

