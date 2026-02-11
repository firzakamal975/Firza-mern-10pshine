const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Dono ko alag alag line par import karein taake confusion na ho
const sequelize = require('./src/config/db'); 
const { connectDB } = require('./src/config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/notes', require('./src/routes/noteRoutes'));

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;

// Database connection aur Sync logic
connectDB().then(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database & tables synced!');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log('❌ Sync error: ' + err);
  }
});