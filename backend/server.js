const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, sequelize } = require('./src/config/db');

// Load env variables
dotenv.config();

const app = express();

// Database connection
connectDB();

// Database Sync
sequelize.sync({ alter: true }) 
  .then(() => console.log('✅ Database & tables synced!'))
  .catch((err) => console.log('❌ Sync error: ' + err));

// Middleware
app.use(cors()); // Frontend communication ke liye zaroori hai
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/notes', require('./src/routes/noteRoutes')); // Notes route lazmi add karein

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});