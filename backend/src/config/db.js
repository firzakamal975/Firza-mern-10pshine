const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
    
    // Tables sync karne ke liye (Optional but recommended)
    // await sequelize.sync({ alter: true }); 
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Isay is tarah export karein taake Model aur Server dono ko sahi cheez mile
module.exports = sequelize; 
module.exports.connectDB = connectDB;