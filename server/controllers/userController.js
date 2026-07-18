import User from '../models/User.js';

export async function getCurrentUser(req, res) {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ user });
}

export async function getSavedLeads(req, res) {
  const user = await User.findById(req.user._id).populate('savedLeads');
  res.json({ savedLeads: user.savedLeads });
}
