const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.log('No Authorization header found');
      return res.status(401).json({ error: 'Please authenticate.' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Add logging to debug token issues
    console.log('Token received:', token.substring(0, 10) + '...');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log the entire decoded token (be careful in production)
    console.log('Decoded token:', JSON.stringify(decoded));
    
    // Extract user ID from the token - check all possible fields
    const userId = decoded.userId || decoded.id || decoded._id;
    
    console.log('Extracted user ID:', userId || 'ID not found');
    
    if (!userId) {
      console.error('No user ID found in token');
      return res.status(401).json({ error: 'Invalid token: user ID not found' });
    }
    
    // Set a standardized user object with id property
    req.user = {
      ...decoded,
      id: userId
    };
    
    console.log('User set in request:', req.user.id);
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Please authenticate.' });
  }
};

module.exports = auth;