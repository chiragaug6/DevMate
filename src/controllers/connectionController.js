const ConnectionRequestModel = require("../models/connectionRequestModel");
const User = require("../models/userModel");
const emailQueue = require("../queues/emailQueue");
const AppError = require("../utils/AppError");
const sendEmail = require("../utils/sendEmail");

const sendConnection = async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    const { status, toUserId } = req.params;

    const validStatus = ["interested", "ignored"];

    const isValidStatus = validStatus.includes(status);

    if (!isValidStatus) {
      return next(new AppError("Invalid Status", 400));
    }

    const user = await User.findById(toUserId);

    if (!user) {
      return next(new AppError("user not found!!", 400));
    }

    const existingConnectionRequest = await ConnectionRequestModel.findOne({
      $or: [
        { fromUserId: loggedInUser._id, toUserId },
        { fromUserId: toUserId, toUserId: loggedInUser._id },
      ],
    });

    if (existingConnectionRequest) {
      return next(new AppError("connection request already exists!!", 409));
    }

    const connectionRequest = new ConnectionRequestModel({
      fromUserId: loggedInUser._id,
      toUserId,
      status,
    });

    await emailQueue.add("sendFriendRequestReminder", {
      email: user.emailId,
      subject: "🔔 New Connection Request on DevMate",
      message: `
        Hi ${user.firstName},
    
        ${loggedInUser.firstName} has sent you a connection request on DevMate.
    
        Click here to view and respond: https://devmate.app/requests
    
        - Team DevMate
      `,
    });

    const requestData = await connectionRequest.save();

    res.status(201).json({
      success: true,
      message: "request send successFully!!",
      data: requestData,
    });
  } catch (error) {
    return next(
      new AppError(error || "get error while sending Connection", 500)
    );
  }
};

const reviewConnection = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    const { status, requestId } = req.params;

    const validStatus = ["accepted", "rejected"];

    const isValidStatus = validStatus.includes(status);

    if (!isValidStatus) {
      return next(new AppError("Invalid Status", 400));
    }

    const connectionRequest = await ConnectionRequestModel.findOne({
      _id: requestId,
      toUserId: loggedInUserId,
      status: "interested",
    });

    console.log(connectionRequest);

    if (!connectionRequest) {
      return next(new AppError("connectionRequest not found!!", 400));
    }

    connectionRequest.status = status;

    const updatedData = await connectionRequest.save();

    res.status(201).json({
      success: true,
      message: "Request Status Updated SuccessFully!!",
      data: updatedData,
    });
  } catch (error) {
    return next(new AppError(error || "get error in review Connection", 500));
  }
};

module.exports = { sendConnection, reviewConnection };
