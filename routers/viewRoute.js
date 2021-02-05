const express = require("express");
const {
  homePage,
  overviewPage,
  tourPage,
  loginPage,
} = require("../controllers/view.controller");

const router = express.Router();

router.get("/", overviewPage);

router.get("/tours/:tourId", tourPage);

router.get("/login", loginPage);

module.exports = router;
