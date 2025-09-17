/* eslint-disable prettier/prettier */
const appError = require('../utils/appError');
const handleProdError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const handleDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};

const handleCastError = (err) => {
  const messages = `Invalid ${err.path} ${err.value} entered`;
  return new appError(messages, 400);
};
const handleDuplicateField = (err) => {
  const keynvalue = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Fields ${keynvalue} Detected`;
  return new appError(message, 400);
};
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input passed ${errors.join('. ')}`;
  return new appError(message, 400);
};
const handleJwtTokenErr = () => new appError('Invalid token please login again', 401);
const handleJwtExpErr = () => new appError('your token has expired please login again', 401);
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    handleDevError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastError(err);
    if (err.code === 11000) err = handleDuplicateField(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleJwtTokenErr();
    if (err.name === 'TokenExpiredError') err = handleJwtExpErr();
    handleProdError(err, res);
  }
  next();
};
