const { Queue } = require("bullmq");
const redisClient = require("../config/redis");

const emailQueue = new Queue("emailNotificationQueue", {
  connection: redisClient,
});

module.exports = emailQueue;
