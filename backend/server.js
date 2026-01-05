const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./src/config/db'); // 1. Import the connection

dotenv.config();

const app = express();

// 2. Execute the connection
connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running and Database is connected!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});