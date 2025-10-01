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
router.delete('/deleteUser', authController.protect, authController.deleteUser);

router.route('/').get(authController.protect, userController.getUsers);
router.route('/:id').get(userController.getUser).post(userController.postUser).delete(userController.deleteUser);

module.exports = router;
