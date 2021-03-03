const AppError = require("../utilities/AppError");

const handleCastErrorDb = (error) => {
  // console.log(error.name);
  const message = `Invalid ${error.path} : ${error.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDb = (error) => {
  console.log("error message", error.message);
  const value = error.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (error) => {
  const errors = Object.values(error.errors).map((el) => el.message);

  const message = `Invalid input data ${errors.join(" ")}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // send message to client
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // programing or other unknow error: donot leak error details
    console.error("Error", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
      err,
    });
  }
};

module.exports.gobalErrorHandle = (err, req, res, next) => {
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "develope") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    console.log("error", err._message);
    if (err._message === "Validation failed")
      error = handleValidationErrorDb(err);

    if (err.name === "CastError") error = handleCastErrorDb(err);

    if (err.code === 11000) error = handleDuplicateErrorDb(err);

    sendErrorProd(error, res);
  }
};
