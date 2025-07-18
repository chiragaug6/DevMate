const cron = require("node-cron");
const ConnectionRequestModel = require("../models/connectionRequestModel");
const { startOfDay, endOfDay } = require("date-fns");
const emailQueue = require("../queues/emailQueue");

console.log("📅 Daily email cron scheduler initialized...");

cron.schedule(process.env.CRON_EXPR, async () => {
  try {
    console.log("🔔 Cron job started");

    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    console.log(
      `🕒 Checking requests between ${start.toISOString()} and ${end.toISOString()}`
    );

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: { $gte: start, $lt: end },
    }).populate("fromUserId toUserId");

    console.log(`🔎 Found ${pendingRequests.length} pending requests`);

    const emails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];

    for (const email of emails) {
      await emailQueue.add("sendFriendRequestReminder", {
        email,
        subject: "New Friend Requests pending on DevMate",
        message:
          "There are some friend requests pending. Please login to DevTinder.in and accept or reject them.",
      });
      console.log(`📬 Queued email to: ${email}`);
    }

    console.log(`✅ Total emails queued: ${emails.length}`);
  } catch (err) {
    console.error("🚨 Failed to queue emails:", err.message);
  }
});
