const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const { razorpayInstance } = require("../config/razorpay");
const PaymentModel = require("../models/paymentModel");
const User = require("../models/userModel");
const membershipAmount = require("../utils/constants");

const initiatePaymentOrder = async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });

    const payment = new PaymentModel({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    const data = {
      ...savedPayment.toJSON(),
      keyId: process.env.RAZORPAY_KEY_ID,
    };

    res.status(201).json({
      success: true,
      message: "Order and Payment Created",
      data: data,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const handlePaymentWebhook = async (req, res) => {
  try {
    console.log("Webhook endpoint called");

    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Received Signature:", webhookSignature);

    // Log raw and parsed body
    console.log("Received Body:", req.body);

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("Invalid Webhook Signature");
      return res.status(400).json({
        success: false,
        message: "Webhook signature is invalid",
      });
    }

    console.log("Webhook Signature Verified");

    const paymentDetails = req.body.payload.payment.entity;
    console.log("💰 Payment Details:", paymentDetails);

    const payment = await PaymentModel.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!payment) {
      console.log("⚠️ No matching order found in DB");
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    payment.status = paymentDetails.status;
    await payment.save();
    console.log("✅ Payment status updated in DB");

    const user = await User.findOne({ _id: payment.userId });
    if (!user) {
      console.log("No matching user found for payment");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isPremium = true;
    user.memberShipType = payment.notes.membershipType;
    await user.save();
    console.log("✅ User updated to Premium");

    return res.status(200).json({
      success: true,
      message: "Webhook received and processed successfully",
    });
  } catch (err) {
    console.error("🔥 Webhook Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const confirmPaymentStatus = async (req, res) => {
  try {
    const user = req.user.toJSON();
    console.log(user);
    if (user.isPremium) {
      return res
        .status(200)
        .json({ success: true, message: "user is Premium", data: user });
    }
    return res
      .status(200)
      .json({ success: true, message: "user is not Premium", data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  initiatePaymentOrder,
  handlePaymentWebhook,
  confirmPaymentStatus,
};
