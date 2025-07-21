const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_SHORT_EXPIRY } // short-lived token
  );
};

const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRY } // long-lived token
  );
};
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
const decodeToken = (token) => jwt.decode(token, { complete: true });
module.exports = {
  verifyToken,
  decodeToken,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
};
