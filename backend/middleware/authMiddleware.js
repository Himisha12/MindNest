import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

// Mandatory Auth Middleware
export const protect = async (req, res, next) => {
  let token;

  // Check HTTP-only cookie first, then Authorization header
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no access token provided' });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }

    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token verification failed' });
  }
};

// Optional Auth Middleware for public routes
export const optionalAuth = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        req.user = await User.findById(decoded.userId).select('-password');
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
};

// Role-Based Access Control (RBAC) Guard Middleware (Day 5 Topic)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `RBAC Restriction: Role '${req.user.role}' is not authorized to perform this action. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};
