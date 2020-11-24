const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const multer = require("multer");

const app = express();
const upload = multer();

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

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === "develope") {
  app.use(morgan("dev"));
}

app.use(getRequestTime);
app.use(upload.none());

app.use("/api/v1/tours", toursRoute);
app.use("/api/v1/users", usersRoute);

module.exports = app;
