const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID: uuidv4 } = require('crypto');
const { store } = require('../services/dataStore');
const { JWT_SECRET } = require('../middleware/auth');

// Helper to sign JWT
const createToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'user', phone = '', specialization, barId, experience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'usr_' + uuidv4().slice(0, 8),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: ['user', 'lawyer', 'admin'].includes(role) ? role : 'user',
      phone: phone.trim(),
      emergencyContacts: (Array.isArray(req.body.emergencyContacts) && req.body.emergencyContacts.length > 0)
        ? [...req.body.emergencyContacts, { name: 'Police Helpline', phone: '112', relationship: 'Emergency' }]
        : [
            { name: 'National Women Helpline', phone: '1091', relationship: 'Emergency' },
            { name: 'Police Helpline', phone: '112', relationship: 'Emergency' },
          ],
      createdAt: new Date(),
    };

    store.users.push(newUser);

    // If registered as lawyer, create profile
    if (newUser.role === 'lawyer') {
      const newLawyerProfile = {
        _id: 'lp_' + uuidv4().slice(0, 8),
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        specialization: specialization || 'General Legal Counsel',
        barId: barId || 'BAR/REG/' + Math.floor(1000 + Math.random() * 9000),
        experience: Number(experience) || 3,
        fee: 500,
        rating: 4.8,
        bio: 'Practicing legal counsel on LawShield platform.',
        location: 'New Delhi, India',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
        verificationStatus: 'pending',
        availability: 'Available Today',
        languages: ['English', 'Hindi'],
        createdAt: new Date(),
      };
      store.lawyers.push(newLawyerProfile);
    }

    const token = createToken(newUser);
    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userSafe,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = createToken(user);
    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userSafe,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// Demo quick-login switch
exports.demoLogin = (req, res) => {
  const { persona } = req.body; // 'citizen' | 'lawyer' | 'admin'
  let targetEmail = 'citizen@lawshield.org';
  if (persona === 'lawyer') targetEmail = 'lawyer@lawshield.org';
  if (persona === 'admin') targetEmail = 'admin@lawshield.org';

  const user = store.users.find(u => u.email === targetEmail);
  if (!user) {
    return res.status(404).json({ success: false, message: `Demo user for '${persona}' not found` });
  }

  const token = createToken(user);
  const { password: _, ...userSafe } = user;

  return res.json({
    success: true,
    message: `Logged in as demo ${persona}`,
    token,
    user: userSafe,
  });
};

// Get current user profile
exports.getMe = (req, res) => {
  const user = store.users.find(u => u._id === req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  const { password: _, ...userSafe } = user;

  let lawyerProfile = null;
  if (user.role === 'lawyer') {
    lawyerProfile = store.lawyers.find(l => l.userId === user._id || l.email === user.email);
  }

  return res.json({
    success: true,
    user: userSafe,
    lawyerProfile,
  });
};

// Update profile / Emergency contacts
exports.updateProfile = (req, res) => {
  const user = store.users.find(u => u._id === req.user._id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { phone, emergencyContacts, name } = req.body;
  if (phone !== undefined) user.phone = phone;
  if (name !== undefined) user.name = name;
  if (emergencyContacts !== undefined && Array.isArray(emergencyContacts)) {
    user.emergencyContacts = emergencyContacts;
  }

  const { password: _, ...userSafe } = user;
  return res.json({
    success: true,
    message: 'Profile updated successfully',
    user: userSafe,
  });
};

// Forgot Password Prototype
exports.forgotPassword = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }
  return res.json({
    success: true,
    message: `Password reset simulation: A temporary reset link and recovery OTP have been dispatched to ${email}. (Demo prototype mode: you can use your existing credentials or demo login).`
  });
};
