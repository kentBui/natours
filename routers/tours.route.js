const express = require("express");
const { requireSignin, restrictTo } = require("../controllers/auth.controler");
const { createReview } = require("../controllers/review.controller");
const {
  getAllTours,
  getOneTour,
  updateTour,
  deleteTour,
  createTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require("../controllers/tours.controller");

const router = express.Router();

router.get("/", getAllTours);

router.get("/top-5-tours", aliasTopTours, getAllTours);
// route for alias find with condition you know

router.get("/tour-stats", getTourStats);

router.get("/monthly-plan/:year", getMonthlyPlan);

router.get("/:id", getOneTour);

router.patch(
  "/:id",
  requireSignin,
  restrictTo("admin", "lead-guide"),
  updateTour
);

router.delete(
  "/:id",
  requireSignin,
  restrictTo("admin", "lead-guide"),
  deleteTour
);

router.post("/create", createTour);

// => nested route
// POST / tour/1234/reviews
// GET /tour/123/reviews
// GET /tour/123/reviews/24719

router.post(
  "/:tourId/reviews/",
  requireSignin,
  restrictTo("user"),
  createReview
);

module.exports = router;
