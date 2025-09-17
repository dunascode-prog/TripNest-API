/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

//router.param('id', tourController.check_id); //use to define parameter middlewarenpm
router.route('/getMonthlyStats/:year').get(tourController.getMonthlyPlan);
router.route('/getTourStats').get(tourController.getTourStats);
router.route('/top-5-tours').get(tourController.aliasTopTours);
router.route('/').get(authController.protect, tourController.getTours).post(tourController.postTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin', 'leadGuide'), tourController.deleteTour);
module.exports = router;
