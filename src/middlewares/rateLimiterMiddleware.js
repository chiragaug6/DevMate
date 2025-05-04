const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  //message: "Too many Login attempts, please try again after 5 minutes",
  keyGenerator: (req) => {
    return req.headers["cf-connecting-ip"] || req.ip;
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    const retryAfter = res.getHeader("RateLimit-Reset") || 300;
    const message = `Too many login attempts. Please try again after ${Math.ceil(
      retryAfter / 60
    )} minute .`;
    res.status(options.statusCode).json({ message });
  },
});

const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requests per IP per window
  message: "Too many requests from this IP, please try again after 5 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, globalLimiter };
