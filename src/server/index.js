const express = require('express');
const appointmentRoutes = require('./routes/appointments');
const { config } = require('../../config/railway');
const connectDB = require('../../config/db');

const app = express();

// Enable JSON parsing middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use('/api/appointments', appointmentRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${config.baseUrl}`);
});