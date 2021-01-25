const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");

const app = express();
const upload = multer();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

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
const reviewRoute = require("./routers/review.route");
const { gobalErrorHandle } = require("./controllers/error.controler");
const { requireSignin } = require("./controllers/auth.controler");

app.use(express.json({ limit: "10kb" }));

// data sanitization against Nosql query injection
app.use(mongoSanitize());

// data sanitization against xss
app.use(xss());

app.use(helmet()); // helmet help you secure express app by setting various http header

if (process.env.NODE_ENV === "develope") {
  app.use(morgan("dev"));
}

app.use(getRequestTime);

app.use(upload.none());

app.get("/", (req, res) => {
  res.render("base", {
    title: "Exciting tours for adventurous people",
  });
});

app.get("/overview", (req, res) => {
  res.render("overview", {
    title: "All Tours",
  });
});

app.get("/tour", (req, res) => {
  res.render("tour", {
    title: "Tour details",
    tour: "Tour 1 detail page",
  });
});

app.use("/api", appLimit); // limit request from same ip

app.use("/api/v1/tours", requireSignin, toursRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/reviews", reviewRoute);

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
