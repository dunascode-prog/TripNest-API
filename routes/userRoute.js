/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword', authController.resetPassword);
router.patch('/updatePassword', authController.protect, authController.updatePassword);
router.patch('/updateData', authController.protect, authController.updateData);
router.route('/').get(authController.protect, userController.getUsers);
router
  .route('/deleteUser')
  .delete(authController.protect, authController.restrictTo('user', 'admin'), authController.deleteUser);
router
  .route('/:id')
  .get(authController.protect, authController.restrictTo('user', 'admin'), userController.getUser)
  .post(authController.protect, userController.postUser)
  .delete(authController.protect, authController.restrictTo('admin'), userController.deleteUser);

module.exports = router;
