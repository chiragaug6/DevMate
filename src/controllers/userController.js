const { ChatModel } = require("../models/chatModel");
const ConnectionRequestModel = require("../models/connectionRequestModel");
const User = require("../models/userModel");

const USER_SAFE_DATA = "firstName lastName age gender about skills photoUrl";

const getReceivedRequests = async (req, res, next) => {
  const loggedInUser = req.user;

  const data = await ConnectionRequestModel.find({
    toUserId: loggedInUser._id,
    status: "interested",
  }).populate("fromUserId", USER_SAFE_DATA);

  res.status(201).json({
    success: true,
    message: "getReceivedRequests!",
    data: data,
  });
};

const getUserConnection = async (req, res, next) => {
  const loggedInUser = req.user;

  const connectionRequests = await ConnectionRequestModel.find({
    $or: [
      {
        fromUserId: loggedInUser._id,
        status: "accepted",
      },
      {
        toUserId: loggedInUser._id,
        status: "accepted",
      },
    ],
  })
    .populate("fromUserId", USER_SAFE_DATA)
    .populate("toUserId", USER_SAFE_DATA);

  const data = connectionRequests.map((row) => {
    if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
      return row.toUserId;
    }

    return row.fromUserId;
  });

  res.status(201).json({
    success: true,
    message: "getUserConnection!",
    data: data,
  });
};

const getUserFeed = async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(201).json({
      success: true,
      message: "get user feed successfully",
      data: users,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUsersChat = async (req, res, next) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await ChatModel.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new ChatModel({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    res.status(201).json({
      success: true,
      message: "get user chats successfully",
      data: chat,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getReceivedRequests,
  getUserConnection,
  getUserFeed,
  getUsersChat,
};
