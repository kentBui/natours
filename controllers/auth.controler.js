const crypto = require("crypto");
const util = require("util"); // create promisify or callbackify
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const Email = require("../utilities/email");
const catchAsync = require("../utilities/catchAsync");
const AppError = require("../utilities/AppError");

const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, //
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  // send cookie to automatic resend each request

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
    ),
    httpOnly: false, //cannot access and modified in any way by the browser
    sameSite: "none",
    // secure: true,
  };

  // if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined; // remove password in the output

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

module.exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get("host")}/me`;

  console.log(url);
  await new Email(newUser, url).sendWellcome();
  createAndSendToken(newUser, 201, res);
});

module.exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1] check email and password exist

  if (!email || !password) {
    return next(new AppError("You need enter enail or password", 400));
  }
  // 2] check if user exists && password is correct

  const user = await User.findOne({ email }).select("+password");
  // console.log(user);
  // ] dont find user with email
  if (!user) return next(new AppError("Incorrect email", 400));

  const correct = await user.correctPassword(password, user.password);

  if (!correct) return next(new AppError("Incorrect password", 400));

  // 3] if everything is ok send token to client
  // let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN, //
  // });

  // let decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // res.status(200).json({
  //   status: "success",
  //   data: {
  //     token,
  //   },
  // });

  createAndSendToken(user, 200, res);
});

module.exports.logout = async (req, res) => {
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logout successful",
  });
};

module.exports.requireSignin = catchAsync(async (req, res, next) => {
  // 1] get token and check it's there

  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    return next(
      new AppError("Authorization is required, please login to get access", 400)
    );
  }

  // console.log(token);

  // 2] verification token
  // let decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);
  let decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // need to remember

  // 3] check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) return next(new AppError("The user doest not exist", 400));

  // 4] check if user change password of the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError("User recently changed password, Pease login again", 400)
    );

  req.user = currentUser;

  next();
});

module.exports.isLogedIn = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return next();
    }

    let decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    if (currentUser.changedPasswordAfter(decoded.iat)) return next();

    req.user = currentUser;
    console.log(currentUser);

    return next();
  } catch (error) {
    next();
  }
};

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']
    // default 'user'

    if (!roles.includes(req.user.role))
      return next(
        new AppError("You do not have permission to perform this action", 400)
      );

    next();
  };
};

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  try {
    // 1] get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    console.log(user);

    if (!user)
      return res.status(404).json({
        status: "Error",
        message: "There is no user with this email",
      });

    // 2] generate the random reset token
    const resetToken = await user.createPasswordResetToken();
    console.log(resetToken);

    await user.save({ validateBeforeSave: false });

    // 3] send it to user's email
    // get url for reset pass
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    // sending message
    try {
      await new Email(user, resetUrl).sendResetPassword();

      res.status(200).json({
        status: "success",
        message: "Token sent to email!",
      });
    } catch (error) {
      // catch error when sending email
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: "error",
        message: "There were an error sending email",
        error,
      });
    }
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Something went wrong, Please login again",
      error,
    });
  }
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1] get user based on the token
  // console.log(req.params.token);
  const hasdedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hasdedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // console.log(user);

  // 2] if token has not expired, and there is user set the new password
  if (!user) return next(new AppError("Token is invalid or has expired", 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // user.passwordChangedAt = new Date()

  await user.save();
  // 3] update changedpasswordat property for the user

  // 4] log the user in, sen jwt
  createAndSendToken(user, 200, res);
});

module.exports.updatedPassword = catchAsync(async (req, res, next) => {
  // 1] get user from collection
  console.log(req.user);
  const user = await User.findById(req.user.id).select("+password");

  // 2] check if posted password is correct
  const { oldPassword, newPassword, newPasswordConfirm } = req.body;
  console.log({ oldPassword, newPassword, newPasswordConfirm });
  if (!oldPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError("Your need enter old or new password", 400));
  }
  if (!(await user.correctPassword(oldPassword, user.password))) {
    return next(new AppError("Your current password is wrong", 400));
  }

  // 3] if so, update password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  // 4] log user in send jwt
  createAndSendToken(user, 200, res);
});
