const socket = require("socket.io");

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });

  io.on("connection", (socket) => {
    // handle event

    socket.on("joinChat", () => {});

    socket.on("sendMessage", () => {});

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
