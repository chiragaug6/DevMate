const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Something went wrong";
  err.stack = process.env.NODE_ENV == "development" ? err.stack : null;

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = errorMiddleware;
