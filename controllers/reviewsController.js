/* eslint-disable prettier/prettier */
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const review = require('../models/reviewsModel');
const handlerFactory = require('./handlerFactory');

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await review.create(req.body);
  res.status(200).json({
    status: 'successful',
    review: newReview,
  });
});

exports.getAllReview = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const allReview = await review.find(filter);
  res.status(200).json({
    status: 'successful',
    result: allReview.length,
    reviews: { allReview },
  });
});

exports.deleteReview = handlerFactory.deleteOne(review);
