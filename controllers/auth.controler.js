const crypto = require("crypto");
const util = require("util"); // create promisify or callbackify
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");
const sendEmail = require("../utilities/email");

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
    secure: true,
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

module.exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    createAndSendToken(newUser, 201, res);
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "some thing went wrong",
      error,
    });
  }
};

module.exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1] check email and password exist

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "You need enter enail or password",
      });
    }
    // 2] check if user exists && password is correct

    const user = await User.findOne({ email }).select("+password");
    // console.log(user);
    // ] dont find user with email
    if (!user)
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email",
      });

    const correct = await user.correctPassword(password, user.password);

    if (!correct)
      return res.status(401).json({
        status: "fail",
        message: "Incorrect password",
      });

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
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "some thing went wrong",
      error,
    });
  }
};

module.exports.requireSignin = async (req, res, next) => {
  // 1] get token and check it's there
  try {
    let token;
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return res.status(400).json({
        status: "error",
        message: "Authorization is required, please login to get access",
      });
    }
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    // 2] verification token
    // let decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    let decoded = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );
    // need to remember

    // 3] check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      return res.status(403).json({
        status: "fail",
        message: "The user doest not exist",
      });

    // 4] check if user change password of the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat))
      return res.status(401).json({
        status: "error",
        message: "User recently changed password, Pease login again",
      });

    req.user = currentUser;

    next();
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Something went wrong, Please login again",
      error,
    });
  }
};

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin','lead-guide']
    // default 'user'

    if (!roles.includes(req.user.role))
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action",
      });

    next();
  };
};

module.exports.forgotPassword = async (req, res, next) => {
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
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;
    // sending message
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to : ${resetURL}. \n If you didn't forget your password, please ignore this email!`;
    try {
      // use nodemailer to send email
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (validated in 10 min)",
        message,
      });

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
};

module.exports.resetPassword = async (req, res, next) => {
  try {
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
    if (!user)
      return res.status(400).json({
        status: "error",
        message: "Token is invalid or has expired",
      });

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // user.passwordChangedAt = new Date()

    await user.save();
    // 3] update changedpasswordat property for the user

    // 4] log the user in, sen jwt
    createAndSendToken(user, 200, res);
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Something went wrong, Please send email again",
      error,
    });
  }
};

module.exports.updatedPassword = async (req, res, next) => {
  try {
    // 1] get user from collection
    console.log(req.user);
    const user = await User.findById(req.user.id).select("+password");

    // 2] check if posted password is correct
    const { oldPassword, newPassword, newPasswordConfirm } = req.body;
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      return res.status(401).json({
        status: "error",
        message: "Your need enter old or new password",
      });
    }

    if (!(await user.correctPassword(oldPassword, user.password))) {
      return res.status(401).json({
        status: "error",
        message: "Your current password is wrong",
      });
    }

    // 3] if so, update password
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();

    // 4] log user in send jwt
    createAndSendToken(user, 200, res);
  } catch (error) {
    res.status(401).json({
      status: "fail",
      message: "Something went wrong, Please send password again",
      error,
    });
  }
};
