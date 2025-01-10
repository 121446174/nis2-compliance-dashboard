const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.headers['authorization'];

    // Check if the Authorization header is present
    console.log('Authorization Header:', authHeader); // Log the header for debugging

    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid authorization format. Expected "Bearer <token>".' });
    }

    const token = parts[1];

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in the environment variables.');
        }

        // Verify the token and log the result
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // Log the decoded token
        req.user = decoded; // Attach the user data
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message); // Log the error
        res.status(400).json({ message: 'Invalid token.' });
    }
};
