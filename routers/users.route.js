const express = require("express");
const { signup, signin } = require("../controllers/auth.controler");
const {
  updateUser,
  deleteUser,
  getOneUser,
  getAllUsers,
} = require("../controllers/users.controller");

const router = express.Router();

router.get("/", getAllUsers);

router.post("/signup", signup); // create user

router.post("/signin", signin); // login user

router.get("/:id", getOneUser);

router.patch("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;
