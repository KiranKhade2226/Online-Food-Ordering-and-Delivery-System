const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const User = require('../models/User');
const { signToken } = require('../services/tokenService');
const { sendMail } = require('../services/emailService');
const { normalizeRole, normalizeUser } = require('../utils/role');

const createAuthResponse = (res, user) => {
  const normalizedUser = normalizeUser(user);
  const token = signToken({ id: normalizedUser._id, role: normalizedUser.role });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, location, phone } = req.body;
  const allowedRoles = ['customer', 'restaurantOwner', 'deliveryPartner', 'admin'];

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: allowedRoles.includes(role) ? normalizeRole(role) : 'customer',
    location,
    phone,
  });

  const token = createAuthResponse(res, user);
  const responseUser = normalizeUser(user);
  delete responseUser.password;

  res.status(201).json(new ApiResponse(201, { user: responseUser, token }, 'Registration successful'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = createAuthResponse(res, user);
  const userObject = normalizeUser(user);
  delete userObject.password;

  res.json(new ApiResponse(200, { user: userObject, token }, 'Login successful'));
});

const me = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, normalizeUser(req.user), 'Current user fetched'));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  await sendMail({
    to: user.email,
    subject: 'Password reset OTP',
    text: `Your OTP for password reset is ${otp}. It expires in 15 minutes.`,
    html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
  });

  res.json(new ApiResponse(200, null, 'OTP sent to registered email'));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.json(new ApiResponse(200, null, 'Password reset successful'));
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json(new ApiResponse(200, null, 'Logged out successfully'));
});

module.exports = { register, login, me, forgotPassword, resetPassword, logout };
