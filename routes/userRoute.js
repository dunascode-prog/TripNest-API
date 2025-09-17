/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.route('/').get(userController.getUsers).post(userController.postUsers);
router.route('/:id').get(userController.getUser).post(userController.postUser).delete(userController.deleteUser);

module.exports = router;
