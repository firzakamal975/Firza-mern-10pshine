const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB, sequelize } = require('./src/config/db'); // sequelize yahan add kiya

dotenv.config();

const app = express();

// Database connection
connectDB();

// Database Sync - Ye tables create karega
sequelize.sync({ alter: true }) 
  .then(() => console.log('✅ Database & tables synced!'))
  .catch((err) => console.log('❌ Sync error: ' + err));

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./src/routes/authRoutes'));

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});