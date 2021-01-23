const Review = require("../model/reviews.model");
const { deleteOne, updateOne } = require("./handleFactory");

module.exports.getAllReviews = async (req, res) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

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
    console.log(req.params.tourId);
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;

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

module.exports.deleteReview = deleteOne(Review);

module.exports.updateReview = updateOne(Review);
