const Redis = require("ioredis");

const redisClient = new Redis({
  host: "redis-16588.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 16588,
  username: "default",
  password: "rY1mNJG4JsydjpBD4blJk3hm7mEQQa6J",
  // tls: {}, // Required for Redis Cloud
  maxRetriesPerRequest: null,
});

module.exports = redisClient;
