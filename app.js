const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

const AppError = require("./utilities/AppError");
const { getRequestTime } = require("./middleware/common.middleware");

mongoose
  .connect(process.env.MONGO_URI, {
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
const viewRoute = require("./routers/view.route");
const bookingRoute = require("./routers/booking.route");

const { gobalErrorHandle } = require("./controllers/error.controler");
const { requireSignin } = require("./controllers/auth.controler");

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// data sanitization against Nosql query injection
app.use(mongoSanitize());

// data sanitization against xss
app.use(xss());

app.use(helmet()); // helmet help you secure express app by setting various http header

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use((req, res, next) => {
  // console.log(req.cookies.jwt);
  next();
});

if (process.env.NODE_ENV === "develope") {
  app.use(morgan("dev"));
}

app.use(getRequestTime);
app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js https://api.mapbox.com/*"
    // "script-src 'self' https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.js https://api.mapbox.com/mapbox-gl-js/v2.0.0/mapbox-gl.css"
  );
  next();
});

app.use("/", viewRoute);

app.use("/api", appLimit); // limit request from same ip

app.use("/api/v1/tours", toursRoute);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/booking", bookingRoute);

app.post("/getcookie", (req, res) => {
  res.cookie("id", "123456");
  res.send("hello");
});

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
