import User from '../models/User.js';
import validator from 'validator';
import generateToken from '../utils/generateToken.js';

export async function registerUser(req, res) {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name) {
      res.status(400);
      throw new Error('Name is required.');
    }

    if (!email) {
      res.status(400);
      throw new Error('Email is required.');
    }

    if (!validator.isEmail(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address.');
    }

    if (!password) {
      res.status(400);
      throw new Error('Password is required.');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long.');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error('An account with this email already exists.');
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        savedLeads: user.savedLeads,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('An account with this email already exists.');
    }

    if (error.name === 'ValidationError') {
      const firstMessage = Object.values(error.errors)[0]?.message || 'Invalid signup data.';
      res.status(400);
      throw new Error(firstMessage);
    }

    throw error;
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  res.json({
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      savedLeads: user.savedLeads,
    },
  });
}
