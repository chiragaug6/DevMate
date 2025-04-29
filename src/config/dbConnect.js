const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.CLOUD_DB_URI);
  } catch (err) {
    console.log("database connection failed!!");
    process.exit(1);
  }
};

module.exports = dbConnect;
