const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path'); // Required for static folder path
const sequelize = require('./src/config/db'); 
const { connectDB } = require('./src/config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Helps with FormData

// Serve Uploads folder as Static (IMPORTANT for Profile Pictures)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/notes', require('./src/routes/noteRoutes'));

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;

// Database connection and Sync logic
connectDB().then(async () => {
  try {
    // Using { alter: true } will update your MySQL tables with new columns like gender/dob/profilePic
    await sequelize.sync({ alter: true });
    console.log('✅ Database & tables synced!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Sync error: ' + err);
  }
});