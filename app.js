const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const multer = require("multer");

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

const toursRoute = require("./routers/tours.route");
const usersRoute = require("./routers/users.route");
const { gobalErrorHandle } = require("./controllers/error.controler");

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === "develope") {
  app.use(morgan("dev"));
}

app.use(getRequestTime);
app.use(upload.none());

app.use("/api/v1/tours", toursRoute);
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
