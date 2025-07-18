const { server } = require("./app.js");
const dbConnect = require("./config/dbConnect.js");

dbConnect()
  .then(() => {
    console.log("Database Connection successfully");
    require("./jobs/dailyEmailCron");
    require("./workers/emailWorker");
    server.listen(process.env.PORT, () => {
      console.log(`Server is Running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("fail to start server!",err);
  });
