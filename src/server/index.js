import express from 'express';
import appointmentRoutes from './routes/appointments.js';
import { config } from './config/railway.js';

const app = express();

// Now we can use config.baseUrl and config.dbUrl
const PORT = process.env.PORT || 3000;

app.use('/api/appointments', appointmentRoutes);

app.listen(PORT, () => {
  console.log(`Server running on ${config.baseUrl}`);
});
