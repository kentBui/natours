module.exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route does not define",
  });
};
module.exports.getOneUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route does not define",
  });
};
module.exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route does not define",
  });
};
module.exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "this route does not define",
  });
};
module.exports.createUser = (req, res) => {
  console.log(req.body);

  res.status(200).json({
    status: "success",
    data: req.body,
  });
};
