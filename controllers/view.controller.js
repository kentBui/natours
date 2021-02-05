const Tour = require("../model/tours.model");

module.exports.tourPage = async (req, res) => {
  try {
    // 1] get tour data from collections include reviews and guide
    const { tourId } = req.params;

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
    const tours = await Tour.find();
    // 2] building template

    // 3] render template
    res.render("overview", {
      title: "All Tours",
      tours,
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
