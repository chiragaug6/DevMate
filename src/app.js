require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cors = require("cors");
const http = require("http");
const initializeSocket = require("./utils/socket");
const { globalLimiter } = require("./middlewares/rateLimiterMiddleware");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.PROD_FRONTEND_URL
        : process.env.LOCAL_FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/user", userRoutes);
app.use("/connection", connectionRoutes);
app.use("/payment", paymentRoutes);

app.use("/ping", (req, res) => {
  res.send("pong");
});

app.get("/debug-ip", (req, res) => {
  res.json({
    ip: req.ip,
    forwardedFor: req.headers["x-forwarded-for"],
  });
});

const server = http.createServer(app);
initializeSocket(server);

app.use(errorMiddleware);

module.exports = { server, app };
