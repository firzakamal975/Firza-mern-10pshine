const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
// Sahi import logic: Dono cheezein ek hi baar mein destructure karein
const { sequelize, connectDB } = require('./src/config/db'); 

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder check (Ensure 'uploads' folder exists in root)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/notes', require('./src/routes/noteRoutes'));

// Global Error Handler (Ye aapko exact error batayega console mein)
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ success: false, message: err.message });
});

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;

// Database connection and Sync logic
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Sync Tables (Alter will update columns without deleting data)
    // Tip: Agar columns abhi bhi nahi ban rahe, toh alter ki jagah force: true use karein ek baar
    await sequelize.sync({ alter: true });
    console.log('✅ Database & tables synced!');

    // 3. Start Listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup error: ' + err);
    process.exit(1);
  }
};

startServer();