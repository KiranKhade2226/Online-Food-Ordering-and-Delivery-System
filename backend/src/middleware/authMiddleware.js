const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { normalizeRole, roleMatches } = require('../utils/role');

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Not authorized, token missing');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    throw new ApiError(401, 'User not found');
  }

  user.role = normalizeRole(user.role);

  req.user = user;
  next();
});

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !roleMatches(req.user.role, allowedRoles)) {
    return next(new ApiError(403, 'Access denied for this role'));
  }

  return next();
};

const verifyJWT = protect;
const authorizeRole = (role) => authorizeRoles(role);

module.exports = { protect, verifyJWT, authorizeRoles, authorizeRole };
