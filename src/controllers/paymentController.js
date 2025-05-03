const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const { razorpayInstance } = require("../config/razorpay");
const PaymentModel = require("../models/paymentModel");
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
    console.log("Webhook Called");
    const webhookSignature = req.get("X-Razorpay-Signature");
    console.log("Webhook Signature", webhookSignature);

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      console.log("INvalid Webhook Signature");
      return res
        .status(400)
        .json({ success: false, message: "Webhook signature is invalid" });
    }

    console.log("Valid Webhook Signature");

    // Udpate my payment Status in DB
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();
    console.log("Payment saved");

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    console.log("User saved");

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Webhook received successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
      .json({ success: true, message: "user is not Premium", ...user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  initiatePaymentOrder,
  handlePaymentWebhook,
  confirmPaymentStatus,
};
