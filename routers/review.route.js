const express = require("express");

const { requireSignin, restrictTo } = require("../controllers/auth.controler");
const {
  getAllReviews,
  createReview,
} = require("../controllers/review.controller");

const router = express.Router({ mergeParams: true });
// mergeParams for another params like tourId
// POST / tour/1234/reviews
// GET / tour/1234/reviews
// POST /reviews

router.get("/", requireSignin, getAllReviews);

router.post("/", requireSignin, restrictTo("user"), createReview);

module.exports = router;
