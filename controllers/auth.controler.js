const util = require("util"); // create promisify or callbackify
const jwt = require("jsonwebtoken");
const User = require("../model/user.model");

module.exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN, //
    });

    res.status(201).json({
      status: "success",
      data: {
        user: {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
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
    let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN, //
    });

    // let decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);

    res.status(200).json({
      status: "success",
      data: {
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

module.exports.requireSignin = async (req, res, next) => {
  // 1] get token and check it's there
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer")
    )
      return res.status(400).json({ message: "Authorization is required" });
    const token = req.headers.authorization.split(" ")[1];

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
