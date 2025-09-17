/* eslint-disable new-cap */
/* eslint-disable arrow-body-style */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
const fs = require('fs');
const Tour = require('../models/tourmodels');
const API_FEATURES = require('../utils/API_FEATURES');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
//const tours = JSON.parse(fs.readFileSync(`./dev-data/data/tours-simple.json`));

// exports.check_id = (req, res, next, val) => {
//   if (val > tours.length) {
//     console.log('an error occured');
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }
//   next();
// };

// In aliasTopTours
// exports.alaisTopTours = (req, res, next) => {
//   Tour = Tour.find().sort('-ratingsAverage average').select('name price ratingsAverage summary').limit(5);
//   next();
// };

// Middleware to prefill query params for "Top Tours"
exports.aliasTopTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.aggregate([
    {
      $sort: {
        price: 1, // ascending
        ratingsAverage: -1, // descending
      },
    },
    {
      $project: {
        name: 1,
        price: 1,
        ratingsAverage: 1,
        summary: 1,
        difficulty: 1,
        _id: 0, // hide _id if you don’t want it
      },
    },
    { $limit: 5 },
  ]);
  res.status(200).json({
    status: 'successful',
    message: tours,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numMonthlyStat: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $sort: {
        numTourStarts: -1,
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    Year: year,
    message: plan,
  });
});
exports.postTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

exports.getTours = catchAsync(async (req, res, next) => {
  const features = new API_FEATURES(Tour.find(), req.query).filter().sort().limitFields(); //.paginate();
  const tour = await features.query;
  res.status(200).json({
    status: 'success',
    results: tour.length,
    data: tour,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new appError('No Tour Available with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// exports.checkBody = (req, res, next) => {
//   // const tour = Object.assign({}, req.body);
//   // if (tour.name && tour.price) return next();
//   else {
//     res.status(400).json({
//       status: 'Invalid',
//       message: 'Bad Request',
//     });
//   }
// };

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidation: true,
  });
  if (!updatedTour) {
    return next(new appError('No Tour Available with that ID', 404));
  }
  res.status(200).json({
    status: 'successful',
    data: {
      //something here
      tour: updatedTour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id); //Its a restful not to send a response to the usse when a delete operation
  if (!tour) {
    return next(new appError('No Tour Available with that ID', 404));
  }
  res.status(204).json({
    status: 'done',
    data: null,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 0 },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numOfTours: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: 'EASY' } },
    },
  ]);
  res.status(200).json({
    status: 'success',
    message: stats,
  });
});
