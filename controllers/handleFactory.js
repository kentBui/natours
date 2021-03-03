// const { Model } = require("mongoose");

const AppError = require("../utilities/AppError");
const catchAsync = require("../utilities/catchAsync");

module.exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError("No document found with that id", 404));

    res.status(204).json({
      status: "success",
      requestAt: req.requestTime,
      result: 1,
      data: null,
    });
  });

module.exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return next(new AppError("No document found with that id", 404));

    res.status(200).json({
      status: "success",
      requestAt: req.requestTime,
      result: 1,
      data: {
        data: doc,
      },
    });
  });

module.exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { body } = req;
    // console.log(body);
    const doc = await Model.create(body);

    if (!doc) return next(new AppError("No document found with that id", 404));

    res.status(200).json({
      status: "success",
      result: 1,
      data: {
        data: doc,
      },
    });
  });
