const express = require("express");
const { requireSignin } = require("../controllers/auth.controler");
const { getCheckoutSession } = require("../controllers/booking.controller");

const router = express.Router();

router.get("/checkout-session/:tourId", requireSignin, getCheckoutSession);

module.exports = router;
