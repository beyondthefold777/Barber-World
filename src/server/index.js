const express = require('express');
const appointmentRoutes = require('./routes/appointments');
const authRoutes = require('./routes/Authroutes');
const documentRoutes = require('./routes/documentRoutes'); // Add this line
const connectDB = require('../../config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enhanced request logging
app.use((req, res, next) => {
  console.log(`
    New Request:
    Time: ${new Date().toISOString()}
    Method: ${req.method}
    Path: ${req.url}
    Body: ${JSON.stringify(req.body)}
    Headers: ${JSON.stringify(req.headers)}
  `);
  next();
});

app.use(express.json());
connectDB();

app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes); // Add this line

app.get('/', (req, res) => {
  res.send('Barber World API is running!');
});

// Global error handler
app.use((err, req, res, next) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  };
  
  console.log('Error occurred:', errorDetails);
  
  res.status(500).json({
    error: err.message,
    path: req.path
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});