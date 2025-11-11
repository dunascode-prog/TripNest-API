/* eslint-disable prettier/prettier */
const user = require('../models/userModels');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const handlerFactory = require('./handlerFactory');

exports.getUsers = catchAsync(async (req, res, next) => {
  if (req.user.roles !== 'admin') next(new appError('Bad auth - only admin can get all users', 401));
  const allUser = await user.find();
  res.status(200).json({
    status: 'success',
    allUser,
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.postUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.postUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
exports.deleteUser = handlerFactory.deleteOne(user);
