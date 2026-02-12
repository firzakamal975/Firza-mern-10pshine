const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { sequelize, connectDB } = require('./src/config/db'); 
const logger = require('./src/utils/logger'); // 1. Logger import karein

// Models import karein associations ke liye
const User = require('./src/models/User');
const Note = require('./src/models/Note');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Associations
User.hasMany(Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId' });

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/notes', require('./src/routes/noteRoutes'));

// Error Middleware (Pino Use Karein)
app.use((err, req, res, next) => {
  logger.error(`Internal Server Error: ${err.stack}`); // 2. console.error ki jagah
  res.status(500).json({ success: false, message: err.message });
});

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    await sequelize.sync({ alter: false });
    logger.info('✅ Database & tables synced with Associations!'); // 3. Logger Info

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`); // 4. Logger Info
    });
  } catch (err) {
    logger.error('❌ Server startup error: ' + err); // 5. Logger Error
    process.exit(1);
  }
};

startServer();
module.exports = app;