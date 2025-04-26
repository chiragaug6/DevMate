const { Router } = require("express");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const {
  getReceivedRequests,
  getUserConnection,
  getUserFeed,
} = require("../controllers/userController");

const router = Router();

router.get("/requests/received", isLoggedIn, getReceivedRequests);

router.get("/connections", isLoggedIn, getUserConnection);

router.get("/feed", isLoggedIn, getUserFeed);

module.exports = router;
