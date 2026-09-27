import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { generateToken } from '../utils/jwt.js';
import { sendOtpEmail } from '../utils/sendEmail.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, name, bio, avatar, role } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      if (userExists.email === email.toLowerCase()) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(username)}`;

    // Generate 6-digit email verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      username,
      email,
      password,
      name,
      role: role === 'admin' ? 'admin' : role === 'reader' ? 'reader' : 'author',
      bio: bio || '',
      avatar: defaultAvatar,
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpires
    });

    const token = generateToken(res, user._id);

    // Send Real Nodemailer OTP Email
    let emailStatus = null;
    try {
      emailStatus = await sendOtpEmail({
        email: user.email,
        name: user.name,
        otpCode: verificationCode
      });
    } catch (emailErr) {
      console.error('Failed to send real OTP email:', emailErr.message);
    }

    // Audit Log Entry
    await AuditLog.create({
      action: 'USER_REGISTER',
      user: user._id,
      username: user.username,
      ip: req.ip || req.socket.remoteAddress,
      details: `New user account created with role [${user.role}]. Verification Code: ${verificationCode}`
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      verificationCodeSimulated: verificationCode,
      emailPreviewUrl: emailStatus?.previewUrl || null,
      createdAt: user.createdAt,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password' });
    }

    const inputLower = emailOrUsername.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: inputLower }, { username: inputLower }]
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      await AuditLog.create({
        action: 'USER_LOGIN_FAILED',
        username: inputLower,
        ip: req.ip || req.socket.remoteAddress,
        details: 'Invalid login attempt',
        statusCode: 401
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(res, user._id);

    // Audit Log Entry
    await AuditLog.create({
      action: 'USER_LOGIN_SUCCESS',
      user: user._id,
      username: user.username,
      ip: req.ip || req.socket.remoteAddress,
      details: `User logged in successfully [Role: ${user.role}]`
    });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified || false,
      verificationCodeSimulated: user.isEmailVerified ? null : user.emailVerificationCode,
      createdAt: user.createdAt,
      token
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address using 6-digit code
// @route   POST /api/auth/verify-email
// @access  Private
export const verifyEmail = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.json({ message: 'Email is already verified', user });
    }

    if (!user.emailVerificationCode || user.emailVerificationCode !== code.trim()) {
      return res.status(400).json({ message: 'Invalid 6-digit verification code' });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    await AuditLog.create({
      action: 'USER_EMAIL_VERIFIED',
      user: user._id,
      username: user.username,
      ip: req.ip || req.socket.remoteAddress,
      details: `User successfully verified email address [${user.email}]`
    });

    res.json({
      message: 'Email address verified successfully!',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        isEmailVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend 6-digit verification email code
// @route   POST /api/auth/resend-verification
// @access  Private
export const resendVerificationCode = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email address is already verified' });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationCode = newCode;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    let emailStatus = null;
    try {
      emailStatus = await sendOtpEmail({
        email: user.email,
        name: user.name,
        otpCode: newCode
      });
    } catch (emailErr) {
      console.error('Failed to send real OTP email:', emailErr.message);
    }

    res.json({
      message: `A new 6-digit OTP code was sent to ${user.email}.`,
      verificationCodeSimulated: newCode,
      emailPreviewUrl: emailStatus?.previewUrl || null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};
