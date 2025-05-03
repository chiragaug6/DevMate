const express = require("express");
const { login, signup, logout } = require("../controllers/authController");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const { loginLimiter } = require("../middlewares/ratelimiterMiddleware");

const router = express.Router();

router.post("/login", loginLimiter, login);

router.post("/signup", signup);

router.post("/logout", isLoggedIn, logout);

module.exports = router;
