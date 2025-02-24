const express = require('express');
const app = express();
const appointmentRoutes = require('./routes/appointments');

app.use('/api/appointments', appointmentRoutes);
