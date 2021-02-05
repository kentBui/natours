const express = require("express");

const {
  signup,
  signin,
  forgotPassword,
  resetPassword,
  requireSignin,
  updatedPassword,
} = require("../controllers/auth.controler");
const {
  updateUser,
  deleteUser,
  getOneUser,
  getAllUsers,
  updateMe,
  deleteMe,
  getMe,
  uploadPhoto,
} = require("../controllers/users.controller");
const userModel = require("../model/user.model");

const router = express.Router();

router.get("/", getAllUsers);

router.post("/signup", signup); // create user

router.post("/signin", signin); // login user

router.post("/forgotPassword", forgotPassword);

router.patch("/resetPassword/:token", resetPassword);

router.patch("/updateMyPassword", requireSignin, updatedPassword);

router.patch("/updateMe", requireSignin, uploadPhoto, updateMe);

router.delete("/deleteMe", requireSignin, deleteMe);

router.get("/me", requireSignin, getMe, getOneUser);

router.get("/:id", getOneUser);

router.patch("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;
