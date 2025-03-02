const express = require('express');
const appointmentRoutes = require('./routes/appointments');
const connectDB = require('../../config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable JSON parsing middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use('/api/appointments', appointmentRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Barber World API is running!');
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
});