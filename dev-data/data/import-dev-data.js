/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../models/tourmodels');

const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
// eslint-disable-next-line import/extensions

dotenv.config({ path: '../../config.env' });

const DB = process.env.DATABASE.replace('<db_username>', process.env.DB_USERNAME).replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
mongoose.connect(DB).then((con) => {
  //console.log(con.connections);
  console.log('DB connection successful');
});

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully read');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(); //because this is an async function if it is put in the if statement the process.exit can be executed first before the main delete function
  }
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(); //because this is an async function if it is put in the if statement the process.exit can be executed first before the main delete function
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
