// utils/generateOTP.js

exports.generateOTP = () => {
  return Math.floor(10000 + Math.random() * 900000).toString();
};
