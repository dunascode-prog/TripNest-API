/* eslint-disable consistent-return */
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id); //Its a restful not to send a response to the usse when a delete operation
    if (!doc) {
      return next(new appError('No Tour Available with that ID', 404));
    }
    res.status(204).json({
      status: 'done',
      data: null,
    });
  });
