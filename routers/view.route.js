const express = require("express");
const { isLogedIn, requireSignin } = require("../controllers/auth.controler");
const {
  homePage,
  overviewPage,
  tourPage,
  loginPage,
  mePage,
  updateData,
} = require("../controllers/view.controller");

const router = express.Router();

router.get("/", isLogedIn, overviewPage);

router.get("/tours/:tourId", isLogedIn, tourPage);

router.get("/login", isLogedIn, loginPage);

router.get("/me", requireSignin, mePage);

router.post("/submit-user-data", requireSignin, updateData);

module.exports = router;
