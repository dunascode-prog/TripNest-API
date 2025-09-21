/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
  passwordResetToken: String,
  passwordResetExpires: Date,
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
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.resetPassword = async function (newPassword, confirmNewPassword) {
  this.password = newPassword;
  this.confirmPassword = confirmNewPassword;

  await this.save();
};
const user = mongoose.model('tourUser', userSchema);

module.exports = user;
