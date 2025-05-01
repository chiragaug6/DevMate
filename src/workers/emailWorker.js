const { Worker } = require("bullmq");
const redisClient = require("../config/redis");
const sendEmail = require("../utils/sendEmail");

console.log("📨 Email worker starting...");

const emailWorker = new Worker(
  "emailNotificationQueue",
  async (job) => {
    try {
      console.log(`📬 [Job ${job.id}] Received job with data:`, job.data);

      const { email, subject, message } = job.data;
      if (!email) {
        throw new Error("Email address is missing in job data.");
      }

      console.log(`➡️ [Job ${job.id}] Sending email to: ${email}`);

      // Sending email
      const emailSent = await sendEmail(email, subject, message);

      if (!emailSent) {
        throw new Error(
          "Failed to send email. No response from email service."
        );
      }

      console.log(`✅ [Job ${job.id}] Email sent successfully to: ${email}`);
    } catch (err) {
      console.error(`❌ [Job ${job.id}] Error while sending email:`, err);
      throw err; // let BullMQ handle retry/failure tracking
    }
  },
  { connection: redisClient }
);

emailWorker.on("completed", (job) => {
  console.log(`🎉 [Job ${job.id}] Completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`⚠️ [Job ${job?.id || "unknown"}] Failed:`, err.message);
});
