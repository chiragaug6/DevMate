const socket = require("socket.io");
const { ChatModel } = require("../models/ChatModel");
const crypto = require("node:crypto");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256") // SHA-256 hashing
    .update([userId, targetUserId].sort().join("$")) // sort IDs so the order doesn't matter
    .digest("hex"); // returns a hashed string
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          let chat = await ChatModel.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new ChatModel({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();

          io.to(roomId).emit("messageReceived", { firstName, lastName, text });
        } catch (err) {
          console.log(err);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
