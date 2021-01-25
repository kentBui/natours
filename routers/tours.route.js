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
  getToursWithin,
  getDistance,
} = require("../controllers/tours.controller");

const reviewRoute = require("./review.route");

const router = express.Router();

router.get("/", getAllTours);
// => nested route
// POST / tour/1234/reviews
// GET /tour/123/reviews
// GET /tour/123/reviews/24719

router.use("/:tourId/reviews", reviewRoute);

router.get("/top-5-tours", aliasTopTours, getAllTours);
// route for alias find with condition you know

router.get("/tour-stats", getTourStats);

router.post(
  "/create",
  requireSignin,
  restrictTo("admin", "lead-guide"),
  createTour
);

router.get("/tours-within/:distance/center/:latlng/unit/:unit", getToursWithin);

router.get("/distance/:latlng/unit/:unit", getDistance);

router.get(
  "/monthly-plan/:year",
  requireSignin,
  restrictTo("admin", "lead-guide"),
  getMonthlyPlan
);

// /tours-distance?distance=222&center=-40,45&unit=mi
// /tours-within/distance=222/latlng=-40,45/unit/mi

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

module.exports = router;
