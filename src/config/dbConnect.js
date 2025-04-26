const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.LOCAL_DB);
  } catch (err) {
    console.log("database connection failed!!");
    process.exit(1);
  }
};

module.exports = dbConnect;
