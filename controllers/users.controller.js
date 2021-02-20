const multer = require("multer");
const sharp = require("sharp");
const User = require("../model/user.model");
const APIfeatures = require("../utilities/apifeatures");
const { deleteOne, updateOne } = require("./handleFactory");

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/users");
  },
  filename: function (req, file, cb) {
    cb(null, `user-${req.user._id}-${Date.now()}-${file.originalname}`);
  },
});

// const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("File upload does not image"));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports.uploadPhoto = upload.single("photo");

module.exports.resizePhoto = (req, file, next) => {
  if (req.file) next();

  req.file.filename = `user-${req.user._id}-${Date.now()}-${file.originalname}`;

  sharp(req.file.buffer)
    .resize(200, 200)
    .toFile(
      `public/img/users/user-${req.user._id}-${Date.now()}-${file.originalname}`
    );
  next();
};

const filterObj = (obj, ...alowFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (alowFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const feature = new APIfeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const users = await feature.query;

    res.status(200).json({
      status: "success",
      requestAt: req.requestTime,
      result: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: {
        error,
      },
    });
  }
};

module.exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

module.exports.getOneUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    // console.log(user);

    res.status(200).json({
      status: "Success",
      requestAt: req.requestTime,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "some thing went wrong",
      error,
    });
  }
};

module.exports.updateMe = async (req, res, next) => {
  try {
    // 1] create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: "error",
        message:
          " This route does not for update password. Please /updateMyPassword",
      });
    }
    // 2] filter user with filter key: name, email
    // dont accept update every info => because user can send info to hack
    // only update name, email, address, description, image, one more thing

    const filteredBody = filterObj(req.body, "name", "email");
    if (req.file) filteredBody.photo = req.file.filename;

    // 2] update user document
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        user: updateUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: "some thing went wrong",
      error,
    });
  }
};

// module.exports.updateUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({
//       status: "Success",
//       requestAt: req.requestTime,
//       data: {
//         user,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({
//       status: "fail",
//       message: {
//         error,
//       },
//     });
//   }
// };

module.exports.updateUser = updateOne(User);

module.exports.deleteMe = async (req, res, next) => {
  // 1] when want to delete => dont need delete out of db, only can set inactive this
  // user. when user signup again => active this user again
  // 2]
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(404).json({
    status: "success",
    message: "You delete successfull",
  });
};

module.exports.deleteUser = deleteOne(User);
