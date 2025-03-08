const validateRegistration = (requiredFields) => {
    return (req, res, next) => {
      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            message: `${field} is required`
          });
        }
      }
  
      // Email validation
      if (req.body.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(req.body.email)) {
          return res.status(400).json({
            message: 'Please provide a valid email address'
          });
        }
      }
  
      // Password validation
      if (req.body.password) {
        if (req.body.password.length < 6) {
          return res.status(400).json({
            message: 'Password must be at least 6 characters long'
          });
        }
      }
  
      // Phone number validation
      if (req.body.phoneNumber) {
        const phoneRegex = /^\+?[\d\s-]{10,}$/;
        if (!phoneRegex.test(req.body.phoneNumber)) {
          return res.status(400).json({
            message: 'Please provide a valid phone number'
          });
        }
      }
  
      next();
    };
  };
  
  module.exports = { validateRegistration };