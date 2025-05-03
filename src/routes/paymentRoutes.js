const { Router } = require("express");
const { isLoggedIn } = require("../middlewares/authMiddleware");
const {
  initiatePaymentOrder,
  handlePaymentWebhook,
  confirmPaymentStatus,
} = require("../controllers/paymentController");

const router = Router();

router.post("/create", isLoggedIn, initiatePaymentOrder);

router.post("/webhook", handlePaymentWebhook);

router.get("/verify", isLoggedIn, confirmPaymentStatus);

module.exports = router;
