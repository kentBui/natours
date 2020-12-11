const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

// name, email, photo, password, passwordConfirm
const userShcema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "You need enter name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "You need enter email"],
    unique: true, // one email per user
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "You need enter password"],
    minlength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "You need enter password"],
    minlength: 6,
    validate: {
      // this only work on CREATE and SAVE !!!
      validator: function (el) {
        return el === this.password; // el = password confirm and this = {}
      },
      message: "Please enter the same password",
    },
  },
});

userShcema.pre("save", async function (next) {
  // only run if password was actually modified
  if (!this.isModified("password")) return next();

  // hash password  with cost 10
  this.password = await bcrypt.hash(this.password, 10);
  // delete password confirm
  this.passwordConfirm = undefined;
  next();
});

userShcema.methods.correctPassword = async function (
  candicatePassword,
  userPassword
) {
  return await bcrypt.compare(candicatePassword, userPassword);
};

module.exports = mongoose.model("User", userShcema);
