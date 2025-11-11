/* eslint-disable no-unused-expressions */
/* eslint-disable prettier/prettier */
const { promisify } = require('util');
const user = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');
const { features } = require('process');

const signToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  return token;
};

const createSendToken = (userForController, statusCode, res) => {
  const token = signToken(userForController._id);
  const cookieOptions = {
    expires: new Date(new Date().getTime() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  };
  userForController.password = undefined;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token: token,
    User: userForController,
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await user.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });
  createSendToken(newUser, 201, res);
  next();
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new appError('input both the email and the password', 400));

  const loggedUser = await user.findOne({ email }).select('+password');
  if (!loggedUser || !(await loggedUser.correctPassword(password, loggedUser.password))) {
    return next(new appError('Invalid email or password', 401));
  }
  createSendToken(loggedUser, 200, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const userFound = await user.findOne({ email });

  if (!userFound) return next(new appError('No User for the Email Found'));

  const userToken = userFound.createPasswordResetToken();
  await userFound.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${userToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: userFound.email,
      subject: 'Your password reset token (valid for 10mins)',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new appError('There was an error sending the email. Try again later!'), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.query.token).digest('hex');
  const userFound = await user.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  if (!userFound) {
    return next(new appError('Token is invalid or has expired', 400));
  }

  const { password, confirmPassword } = req.body;
  userFound.password = password;
  userFound.confirmPassword = confirmPassword;

  userFound.passwordResetToken = undefined;
  userFound.passwordResetExpires = undefined;

  await userFound.save();
  createSendToken(userFound, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const isUser = await user.findById(req.user.id).select('+password');
  if (!isUser.correctPassword(req.body.password, isUser.password))
    return next(new appError('your current Password is wrong'), 401);

  isUser.password = req.body.password;
  isUser.confirmPassword = req.body.confirmPassword;

  await isUser.save();
  createSendToken(isUser, 201, res);
});
const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    allowedFields.includes[el];
    newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateData = catchAsync(async (req, res, next) => {
  if (req.body.password || req.user.confirmPassword)
    return next(new appError('Error you cannot change your password with this route', 401));

  const filteredBody = filterObject(req.body, 'name', 'email');
  const updatedUser = await user.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });
  await updatedUser.save();

  res.status(200).json({
    status: 'successful',
    updatedUser,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const updated = await user.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'Inactive',
    updated,
  });
});
