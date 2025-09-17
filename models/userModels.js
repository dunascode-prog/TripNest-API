/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'Invalid Email Entered'],
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  photo: String,
  confirmPassword: {
    type: String,
    required: true,
    validate: [
      function (val) {
        return this.password === val;
      },
      'password and confirm password must be same',
    ],
  },
  passwordChangedAt: {
    type: Date,
  },
  roles: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});
userSchema.methods.correctPassword = function (currentPassword, userPassword) {
  return bcrypt.compare(currentPassword, userPassword);
};

userSchema.methods.isPasswordChanged = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime(), 10) > JwtTimeStamp;
  }
  return false;
};
const user = mongoose.model('tourUser', userSchema);

module.exports = user;
