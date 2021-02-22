const Tour = require("../model/tours.model");
const User = require("../model/user.model");

module.exports.tourPage = async (req, res) => {
  try {
    // 1] get tour data from collections include reviews and guide
    const { tourId } = req.params;
    const user = req.user;

    const tour = await Tour.findById(tourId).populate({
      path: "reviews",
      select: "review rating user",
    });

    // res.json({ tour });

    // 2] building template
    // 3] render template
    res.render("tour", {
      title: `${tour.name} tour`,
      tour,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.overviewPage = async (req, res) => {
  try {
    // 1] get tour data from collections
    const user = req.user;
    const tours = await Tour.find();
    // 2] building template

    // 3] render template
    res.render("overview", {
      title: "All Tours",
      tours,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports.loginPage = async (req, res) => {
  res.render("login", {
    name: "Kent",
  });
};

module.exports.mePage = async (req, res) => {
  const user = req.user;
  res.render("account", {
    user,
    title: "Your account",
  });
};

module.exports.updateData = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.render("account", {
      user: updatedUser,
      title: "Your account",
    });

    // if (!updatedUser)
    //   return res.status(400).json({
    //     status: "error",
    //     message: "Something went wrong when update user info",
    //   });

    // res.status(200).json({
    //   status: "success",
    //   data: {
    //     user: updatedUser,
    //   },
    // });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
