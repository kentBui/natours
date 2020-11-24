const express = require("express");
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

router.patch("/:id", updateTour);

router.delete("/:id", deleteTour);

router.post("/create", createTour);

module.exports = router;
