const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const multer = require("multer");
const rateLimit = require("express-rate-limit");

const app = express();
const upload = multer();

const AppError = require("./utilities/AppError");
const { getRequestTime } = require("./middleware/common.middleware");

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    // console.log(con.connections);
    console.log("DB connected");
  });

//use limiter to limit request send from this device
const appLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  message: "Too many request from this Ip, please try again in another time",
});

const toursRoute = require("./routers/tours.route");
const usersRoute = require("./routers/users.route");
const { gobalErrorHandle } = require("./controllers/error.controler");
const { requireSignin } = require("./controllers/auth.controler");

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === "develope") {
  app.use(morgan("dev"));
}

app.use(getRequestTime);
app.use(upload.none());

app.use("/api/v1", appLimit);

app.use("/api/v1/tours", requireSignin, toursRoute);
app.use("/api/v1/users", usersRoute);

// handling unhandle routers
app.all("*", (req, res, next) => {
  // 1] normal
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on the server`,
  // });
  // 2] dont use class
  // let err = new Error(`Can't find ${req.originalUrl} on the server`);
  // err.status = "fail";
  // err.statusCode = 404;
  // next(err);

  // 3] use class
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

// error handling
app.use(gobalErrorHandle);

module.exports = app;
