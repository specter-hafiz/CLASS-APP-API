// utils/generateOTP.js

exports.generateOTP = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};
