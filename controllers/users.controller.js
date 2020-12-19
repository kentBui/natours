const User = require("../model/user.model");
const APIfeatures = require("../utilities/apifeatures");

const filterObj = (obj, ...alowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alowFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

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
      message: "some thing went wrong",
      error,
    });
  }
};

module.exports.updateMe = async (req, res, next) => {
  try {
    // 1] create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: "error",
        message:
          " This route does not for update password. Please /updateMyPassword",
      });
    }
    // 2] filter user with filter key: name, email
    // dont accept update every info => because user can send info to hack
    // only update name, email, address, description, image, one more thing

    const filteredBody = filterObj(req.body, "name", "email");
    // 2] update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updateUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "some thing went wrong",
      error,
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

module.exports.deleteMe = async (req, res, next) => {
  // 1] when want to delete => dont need delete out of db, only can set inactive this
  // user. when user signup again => active this user again
  // 2]
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(404).json({
    status: "success",
    message: "You delete successfull",
  });
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
