const express = require('express');
const appointmentRoutes = require('./routes/appointments');
const { config } = require('./config/railway');

const app = express();

const PORT = process.env.PORT || 3000;

app.use('/api/appointments', appointmentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${config.baseUrl}`);
});
