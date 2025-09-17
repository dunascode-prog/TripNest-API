/* eslint-disable new-cap */
/* eslint-disable prettier/prettier */
// eslint-disable-next-line import/newline-after-import
const express = require('express');
const app = express();
const morgan = require('morgan');
const appError = require('./utils/appError');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const globalErrorHandler = require('./controllers/errorController');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//you can research middlewares from morgans website or express website
app.use((req, res, next) => {
  req.dateRequested = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all(/^(?!\/api\/v1\/(?:tours|users)$).*/, (req, res, next) => {
  next(new appError(`this ${req.originalUrl} route doesn't exist`, 404));
});
app.use(globalErrorHandler);

module.exports = app;
// app.get('/', (req, res) => {
//   res.status(200).json({
//     message: 'Welcome to the server...',
// //     app: 'natours',
//   });
// });

// app.post('/', (req, res) => {
//   res.send('you can now make your post....');
// });

//First Method
// app.get('/api/v1/tours', getTours);
// app.post('/api/v1/tours', postTours);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', patchTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//second Method
// app.route('/api/v1/tours').get(getTours).post(postTours);
// app.route('/api/v1/tours/:id').get(getTour).patch(patchTour).delete(deleteTour);
// app.route('/api/v1/users').get(getUsers).post(postUsers);
// app.route('/api/v1/users/:id').get(getUser).patch(postUser).delete(deleteUser);

//Third method
