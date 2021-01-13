const Review = require("../model/reviews.model");

module.exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find();

    if (reviews.length === 0)
      return res.status(400).json({
        status: "error",
        message: "Do not find reviews",
      });

    res.status(200).json({
      status: "success",
      result: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error,
    });
  }
};

module.exports.createReview = async (req, res) => {
  try {
    const newReview = await Review.create(req.body);

    res.status(200).json({
      status: "success",
      data: {
        review: newReview,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      error,
    });
  }
};
