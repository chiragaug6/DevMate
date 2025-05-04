const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const { validateEditProfileData } = require("../utils/validation");

const viewProfile = async (req, res, next) => {
  try {
    const userData = req.user;

    if (!userData) {
      return next(new AppError("User Not Found", 404));
    }

    res.status(201).json({
      message: "profile data",
      data: userData,
    });
  } catch (error) {
    return next(new AppError(error || "Profile data not found!!", 404));
  }
};

const editProfile = async (req, res, next) => {
  try {
    validateEditProfileData(req.body);

    const newData = req.body;

    const oldUserData = req.user;

    Object.keys(newData).forEach((key) => {
      oldUserData[key] = newData[key];
    });

    const userData = await oldUserData.save();

    res.status(201).json({
      message: "profile data",
      data: userData,
    });
  } catch (error) {
    return next(new AppError(error || "Profile Edit Fail!!", 500));
  }
};

const deleteProfile = async (req, res, next) => {
  const userId = req.user._id;

  const deletedUser = await User.findByIdAndDelete(userId);

  res.status(201).json({
    message: "profile delete successfully",
    data: deletedUser,
  });
};

module.exports = { viewProfile, editProfile, deleteProfile };
