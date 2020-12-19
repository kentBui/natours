const crypto = require("crypto");
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
  role: {
    type: String,
    enum: ["admin", "user", "guide", "lead-guide"],
    default: "user",
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
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

userShcema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// query middleware
userShcema.pre(/^find/, function (next) {
  // this poingt to the current query
  this.find({ active: { $ne: false } });
  next();
});

userShcema.methods.correctPassword = async function (
  candicatePassword,
  userPassword
) {
  return await bcrypt.compare(candicatePassword, userPassword);
};

userShcema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);
    return changedTimestamp > JWTTimestamp;
  }

  return false; // dont change
  // if changedTimestamp > token decoded timestamp mean change password after login
};

userShcema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // build in module in node
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log({ resetToken }, { passwordResetToken: this.passwordResetToken });

  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userShcema);
