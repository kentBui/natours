const express = require("express");
const {
  updateUser,
  deleteUser,
  createUser,
  getOneUser,
  getAllUsers,
} = require("../controllers/users.controller");

const router = express.Router();

router.get("/", getAllUsers);

router.get("/:id", getOneUser);

router.patch("/:id", updateUser);

router.delete("/:id", deleteUser);

router.post("/create", createUser);

module.exports = router;
