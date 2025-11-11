/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewsController');
const authController = require('../controllers/authController');

router
  .route('/')
  .get(authController.protect, reviewController.getAllReview)
  .post(authController.protect, authController.restrictTo('user', 'admin'), reviewController.createReview);

router
  .route('/:id')
  .delete(authController.protect, authController.restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;
