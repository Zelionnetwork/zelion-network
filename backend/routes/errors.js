const express = require('express');
const router = express.Router();

// Mock error data - in a real implementation, this would connect to a database
let errorLogs = [];

// Log an error
router.post('/log', (req, res) => {
  const { message, stack, userMessage, timestamp } = req.body;
  
  const errorLog = {
    id: Date.now().toString(),
    message,
    stack,
    userMessage,
    timestamp: timestamp || new Date().toISOString()
  };
  
  errorLogs.push(errorLog);
  
  // Keep only the last 100 errors
  if (errorLogs.length > 100) {
    errorLogs = errorLogs.slice(-100);
  }
  
  res.status(201).json({ success: true, id: errorLog.id });
});

// Get recent errors
router.get('/recent', (req, res) => {
  // Return the last 10 errors
  const recentErrors = errorLogs.slice(-10);
  res.json(recentErrors);
});

module.exports = router;
