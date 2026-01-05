const { Sequelize } = require('sequelize');
require('dotenv').config();

// Initialize Sequelize with credentials from your .env file
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql', // Ensure this matches your DB (mysql or postgres)
    logging: false,    // Prevents flooding your terminal with SQL logs
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = { sequelize, connectDB };