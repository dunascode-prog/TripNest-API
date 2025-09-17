/* eslint-disable prettier/prettier */
const { promisify } = require('util');
const user = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');

const signToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return token;
};

exports.signUp = catchAsync(async (req, res, next) => {
  //   const newUser = await user.create(req.body);
  //using this everyone can specify a role: admin into our application which is a security threat
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);
  //jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.status(200).json({
    status: 'success',
    token: token,
    User: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new appError('input both the email and the password', 400));

  const loggedUser = await user.findOne({ email }).select('+password');
  if (!loggedUser || !(await loggedUser.correctPassword(password, loggedUser.password))) {
    return next(new appError('Invalid email or password', 401));
  }
  const token = signToken(loggedUser._id);
  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new appError('You are not logged in, please log in to get access', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const onlineUser = await user.findById(decoded.id);
  if (!onlineUser) {
    return next(new appError("This user doesn't exist", 401));
  }

  if (onlineUser.isPasswordChanged(decoded.iat)) {
    return next(new appError('The password for the user has changed login again', 401));
  }
  req.user = onlineUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(new appError('You do not have permission to perform this action', 403));
    }
    next();
  };
