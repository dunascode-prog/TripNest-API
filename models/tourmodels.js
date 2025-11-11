const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const user = require('./userModels');
/* eslint-disable prettier/prettier */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //validators - validates if the data is there
      unique: true,
      maxlength: [40, 'A tour Name has to have a maxlength of 40'],
      minlength: [10, 'A tour Name must have a minlength of 10'],
      validate: [
        function (val) {
          return validator.isAlpha(val.replace(/\s/g, ''));
        },
        'Tour name must only contain letters',
      ],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'A rating must be greater than 1.0'],
      max: [5, 'A rating must be less than 5.0'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: "A tour's difficulty is either easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: [
        function (val) {
          return this.price > val;
        },
        'the pricediscount must be less than the price',
      ],
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'The tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    image: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      required: [true, 'There should be a boolean in here'],
      default: false,
    },
    startLocation: {
      //GetJson
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      address: String,
      day: Number,
      description: String,
    },
    locations: [
      {
        //GetJson
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        day: Number,
        description: String,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'tourUser',
        // ref: user,
        required: [true, 'A tour must have a guide'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'review', // The model to use
  foreignField: 'tour', // The field in review model
  localField: '_id', // The field in tour model
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function (next) {
//   this.slug = slugify(this.name, { lower: true });
//   const guides = this.guides.map(async (el) => await user.findById(el));
//   this.guides = await Promise.all(guides);
//   next();
// });

tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //console.log(this.pipeline());
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} in Milliseconds`);
  //console.log(docs);
  next();
});

const tour = mongoose.model('tour', tourSchema);

module.exports = tour;
