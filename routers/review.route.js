const express = require("express");

const { requireSignin, restrictTo } = require("../controllers/auth.controler");
const {
  getAllReviews,
  createReview,
} = require("../controllers/review.controller");

const router = express.Router();

router.get("/", requireSignin, getAllReviews);

router.post("/create", requireSignin, restrictTo("user"), createReview);

module.exports = router;
