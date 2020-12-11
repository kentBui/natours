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
        message: error,
      });
    }
    // 2] check if user exists && password is correct

    const user = User.findOne({email})

    // 3] if everything is ok send token to client
    let token = "";
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
