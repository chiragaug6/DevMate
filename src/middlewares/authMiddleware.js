const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AppError = require("../utils/AppError");

const isLoggedIn = async (req, res, next) => {
  // get token from cookies
  const { token } = req.cookies;

  if (!token) {
    return next(new AppError("unauthorized Login Again", 401));
  }

  const userId = await jwt.verify(token, process.env.JWT_SECRET_KEY);

  // verify token with jwt secret key and decode the userData
  if (!userId) {
    return next(new AppError("unauthorized USER NOT FOUND!", 404));
  }

  const user = await User.findById(userId);

  // set user data into req object
  req.user = user;

  // call next function
  next();
};

module.exports = { isLoggedIn };
