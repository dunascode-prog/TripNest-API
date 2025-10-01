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
  active: {
    type: Boolean,
    required: true,
    default: true,
    select: false,
  },
  roles: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified(this.password) || this.isNew) return next();

  if (this.passwordChangedAt) this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = function (currentPassword, userPassword) {
  return bcrypt.compare(currentPassword, userPassword);
};

userSchema.methods.isPasswordChanged = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000, 10) > JwtTimeStamp;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const user = mongoose.model('tourUser', userSchema);

module.exports = user;
