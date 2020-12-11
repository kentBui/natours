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
    console.log(user);

    const correct = await user.correctPassword(password, user.password);

    if (!user || !correct)
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      });

    // 3] if everything is ok send token to client
    let token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN, //
    });

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
  try {
    // 1] get token and check it's there
    let token;
    // console.log(req.headers);
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log(token);
    if (!token) {
      res.status(400).json({
        status: "fail",
        message: "You are not loggoed in, Please log in to access",
      });
    }

    // 2] verification token
    // 3] check if user still exists
    // 4] check if user change password of the token was issued
    next();
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "You don't exists",
    });
  }
};
