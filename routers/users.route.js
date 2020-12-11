const express = require("express");
const { signup, signin } = require("../controllers/auth.controler");
const {
  updateUser,
  deleteUser,
  createUser,
  getOneUser,
  getAllUsers,
} = require("../controllers/users.controller");

const router = express.Router();

router.get("/", getAllUsers);

router.post("/signup", signup);

router.post("/signin", signin);

router.post("/create", createUser);

router.get("/:id", getOneUser);

router.patch("/:id", updateUser);

router.delete("/:id", deleteUser);

module.exports = router;
