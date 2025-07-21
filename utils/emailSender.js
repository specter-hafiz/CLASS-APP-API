// utils/emailSender.js

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // or 'Mailgun', 'SendGrid', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (email, otp) => {
  console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
  console.log(`Sending OTP to ${email}: ${otp}`);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your verification code is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
  console.log(transporter.options.auth);
};
