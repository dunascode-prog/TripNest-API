/* eslint-disable prettier/prettier */
const nodemailer = require('nodemailer');

exports.sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
  });

  const mailOptions = {
    from: 'dunamis Omodara <dunamiseyi2019@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  await transporter.sendMail(mailOptions);
};
