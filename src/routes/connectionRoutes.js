const { Router } = require("express");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const {
  sendConnection,
  reviewConnection,
} = require("../controllers/connectionController");

const router = Router();

router.post("/send/:status/:toUserId", isLoggedIn, sendConnection);

router.post("/review/:status/:requestId", isLoggedIn, reviewConnection);

module.exports = router;
