const { Model } = require("mongoose");

module.exports.deleteOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc)
      return res.status(404).json({
        status: "error",
        message: "No document found with that id",
      });

    res.status(204).json({
      status: "success",
      requestAt: req.requestTime,
      result: 1,
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

module.exports.updateOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc)
      return res.status(400).json({
        status: "error",
        message: "Do not fount document with that id",
      });

    res.status(200).json({
      status: "success",
      requestAt: req.requestTime,
      result: 1,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

module.exports.createOne = (Model) => async (req, res) => {
  try {
    const { body } = req;
    // console.log(body);
    const doc = await Model.create(body);

    if (!doc)
      return res.status(400).json({
        status: "error",
        message: "Do not create document",
      });

    res.status(200).json({
      status: "success",
      result: 1,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      err,
    });
  }
};
