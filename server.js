/* eslint-disable prettier/prettier */
/* eslint-disable no-console */
/* eslint-disable import/newline-after-import */
/* eslint-disable prettier/prettier */
process.on('uncaughtException', (err) => {
  console.log(`${err.name} : ${err.message}`);
  console.log('UNHANDLED EXCEPTIONS SYNC');
  process.exit(1);
});
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<db_username>', process.env.DB_USERNAME).replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
// mongoose.connect(DB).then((con) => {
//   //console.log(con.connections);
//   console.log('DB connection successful');
// });
async function connectDB() {
  await mongoose.connect(DB);
  console.log('DB connection successful!');
}

//if error occurs anywhere in the middleware then its going to be handled by the middleare handler.
// eslint-disable-next-line new-cap
//example use of the model
//   name: 'The Lagoon Front',
//   rating: 4.7,
//   price: 485,
//   location: 'Unilag, Akoka',
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});
process.on('unhandledRejection', (err) => {
  console.log(`${err.name} : ${err.message}`);
  console.log('UNHANDLED EXCEPTIONS ASYNC');
  server.close(() => {
    process.exit(1);
  });
});
connectDB();
