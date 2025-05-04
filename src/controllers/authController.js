const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const isCaptchaValid = require("../utils/isCaptchaValid");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");

const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, emailId, password, token } = req.body;

    validateSignUpData({ firstName, lastName, emailId, password });

    if (!isCaptchaValid(token)) {
      return res.status(403).json({
        success: false,
        message: "reCAPTCHA verification failed",
      });
    }

    // check if the user already there in DB then send response
    const isUserExists = await User.findOne({ emailId });

    if (isUserExists) {
      return next(new AppError("Account already exists. Please login.", 409));
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // if new User then create a User Model instance
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });

    // now call save method
    const savedUser = await user.save();

    // generate a jwt token
    const jwtToken = await savedUser.generateToken();

    // set Token in res cookies
    res.cookie("token", jwtToken, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: true,
    });

    user.password = undefined;

    // send response that user register successfully
    res.status(201).json({
      success: true,
      message: "user signup successfully",
      data: user,
    });
  } catch (err) {
    return next(new AppError(err.message || "Signup failed", 500));
  }
};

const login = async (req, res, next) => {
  try {
    // get data from the body
    const { emailId, password } = req.body;

    // check if the data is valid or not
    if (!emailId || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    // find user with email is present or if not then send response
    const user = await User.findOne({ emailId }).select("+password");

    if (!user) {
      return next(new AppError("Account not found. Please sign up.", 404));
    }

    // check for user provided password with HashPassword in DB if same or if not send response
    const isPasswordCorrect = await user.checkPassword(password);

    if (!isPasswordCorrect) {
      return next(new AppError("Invalid credentials", 401));
    }

    // generate a jwt token
    const token = await user.generateToken();

    // set Token in res cookies
    res.cookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: true,
    });

    user.password = undefined;

    // send response
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: user,
    });
  } catch (err) {
    return next(new AppError(err.message || "Login failed", 500));
  }
};

const logout = (req, res) => {
  // set null token inside cookie with same expires right now
  res.cookie("token", null, {
    maxAge: 0, // 7 days
  });

  // send response
  res.status(200).json({
    success: true,
    message: "Logout successful",
    data: null,
  });
};

module.exports = { login, signup, logout };
