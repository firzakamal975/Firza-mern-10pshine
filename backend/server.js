const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { sequelize, connectDB } = require('./src/config/db'); 

// Models import karein associations ke liye
const User = require('./src/models/User');
const Note = require('./src/models/Note');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Associations (Yahi delete fix karega)
User.hasMany(Note, { foreignKey: 'userId', onDelete: 'CASCADE' });
Note.belongsTo(User, { foreignKey: 'userId' });

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/notes', require('./src/routes/noteRoutes'));

app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ success: false, message: err.message });
});

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    // Yahan sync models ke link hone ke baad hoga
    await sequelize.sync({ alter: false });
    console.log('✅ Database & tables synced with Associations!');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup error: ' + err);
    process.exit(1);
  }
};

startServer();
module.exports = app;