const dotenv = require("dotenv");

// handle uncautht exception
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception. Shutting down");
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config();

const app = require("./app");

const port = process.env.PORT || 2000;

const server = app.listen(port, () => {
  console.log(`listen server from port: ${port}`);
});

// handle error outsite express
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandler Rejection! Shutting down ..");
  server.close(() => {
    process.exit(1);
  });
});

// console.log(x);
