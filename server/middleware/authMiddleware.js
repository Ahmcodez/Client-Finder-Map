import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('User no longer exists.');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed.');
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    res.status(403);
    throw new Error('Admin access required.');
  }

  next();
}
