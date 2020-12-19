const User = require("../model/user.model");
const APIfeatures = require("../utilities/apifeatures");

module.exports.getAllUsers = async (req, res) => {
  try {
    const feature = new APIfeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const users = await feature.query;

    res.status(200).json({
      status: "success",
      requestAt: req.requestTime,
      result: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: {
        error,
      },
    });
  }
};

module.exports.getOneUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // console.log(user);

    res.status(200).json({
      status: "Success",
      requestAt: req.requestTime,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: {
        error,
      },
    });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "Success",
      requestAt: req.requestTime,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: {
        error,
      },
    });
  }
};
module.exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "Success",
      requestAt: req.requestTime,
      message: "You delete success",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: {
        error,
      },
    });
  }
};
