const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const authMiddleware = {
  /**
   * Protect routes - verify JWT token and attach user to request
   */
  async protect(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const token = authHeader.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          department: true
        }
      });
      
      if (!user) {
        return res.status(401).json({ message: 'User no longer exists' });
      }
      
      // Attach user to request
      req.user = { ...decoded, ...user };
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  },
  
  /**
   * Restrict access to specific roles
   */
  restrictTo(...roles) {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }
      next();
    };
  }
};

module.exports = authMiddleware;