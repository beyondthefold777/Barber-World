require('dotenv').config();

const RAILWAY_URL = 'https://barber-world-production.up.railway.app';
const MONGODB_URL = process.env.MONGO_CONNECTION_STRING;

module.exports = {
  config: {
    baseUrl: RAILWAY_URL,
    dbUrl: MONGODB_URL
  }
};