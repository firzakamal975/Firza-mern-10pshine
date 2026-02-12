const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    // FIX: Dono support karega - "Bearer <token>" aur direct <token>
    let token = null;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      } else {
        token = authHeader; // Direct token case
      }
    }

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    if (!process.env.JWT_SECRET) {
      logger.error("JWT_SECRET is missing");
      return res.status(500).json({ message: "Server Config Error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token structure" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    logger.error(`Auth Error: ${err.message}`);
    const message = err.name === 'TokenExpiredError' ? "Token expired" : "Invalid token";
    res.status(401).json({ message });
  }
};