require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const dbConnect = require("./config/dbConnect");
const errorMiddleware = require("./middlewares/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const userRoutes = require("./routes/userRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/connection", connectionRoutes);

app.use(errorMiddleware);

dbConnect()
  .then(() => {
    console.log("Database Connection successfully");
    app.listen(process.env.PORT, () => {
      console.log(`Server is Running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("fail to start server!");
  });
