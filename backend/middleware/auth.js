// Inspired Reference = https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET); // Splitting "Bearer <token>"
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
