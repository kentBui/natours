const { query } = require("express");
const Tour = require("../model/tours.model");
const APIfeatures = require("../utilities/apifeatures");
const AppError = require("../utilities/AppError");
const catchAsync = require("../utilities/catchAsync");
const { deleteOne, updateOne, createOne } = require("./handleFactory");

module.exports.aliasTopTours = (req, res, next) => {
  //alias to fix req how to find 'top find' with condition
  req.query.limit = "5";
  req.query.sort = "-ratingAverage,price";
  req.query.fields = "name, duration, difficulty, price, description";
  next();
};

module.exports.getAllTours = catchAsync(async (req, res) => {
  // [ before refactor with class APIFeatures ]

  // const queryObj = { ...req.query };
  // //1] querry
  // // ?duration=5
  // const excludedFields = ["page", "sort", "limit", "fields"];

  // excludedFields.forEach((el) => delete queryObj[el]);
  // // delete fields === excludedfield note [el]

  // // 2] addvance query
  // // ?duration[lt]=5
  // let queryStr = JSON.stringify(queryObj); // note let

  // console.log("before replace:", queryStr);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // console.log("after replace:", queryStr);

  // let query = Tour.find(JSON.parse(queryStr)); // note let

  // // 3] sorting
  // // ?sort=field1,field2
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(",").join(" ");
  //   query = query.sort(sortBy);
  //   //sort('field1 field2')
  // } else {
  //   query = query.sort("createdAt");
  // }

  // // 4] field limiting
  // // ?fields=name,duration,difficulty,price
  // // ?fields=-name,-duration => replace out result
  // if (req.query.fields) {
  //   let fields = req.query.fields.split(",").join(" ");
  //   query = query.select(fields);
  // } else {
  //   query = query.select("-__V");
  // }

  // // 5] pagination page and limit
  // //.skip(x).limit(limit)

  // let page = req.query.page * 1 || 1;
  // let limit = req.query.limit * 1 || 100;

  // let skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   // check page
  //   if (skip >= numTours) throw new Error("this page does not exist");
  // }

  //execute query

  // const tours = await query;

  // [ after refactor with class APIFeatures ]
  const feature = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // const tours = await feature.query.explain();// for see result and check info
  const tours = await feature.query;

  res.status(200).json({
    status: "success",
    requestAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
});

module.exports.getOneTour = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const tour = await Tour.findById(req.params.id).populate({
    path: "reviews",
  });
  // console.log(tour);
  if (!tour)
    return next(
      new AppError(`Do not found Tour with ${req.params.id} id`, 404)
    );
  // Tour.findOne({_id: req.params.id})
  res.status(200).json({
    status: "success",
    requestAt: req.requestTime,
    result: 1,
    data: {
      tour,
    },
  });
});

// module.exports.updateTour = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({
//       status: "success",
//       requestAt: req.requestTime,
//       result: 1,
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };
module.exports.updateTour = updateOne(Tour);

// module.exports.deleteTour = async (req, res) => {
//   try {
//     await Tour.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//       status: "success",
//       requestAt: req.requestTime,
//       result: 1,
//       data: null,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "fail",
//       message: err,
//     });
//   }
// };
module.exports.deleteTour = deleteOne(Tour);

// module.exports.createTour = async (req, res) => {
//   try {
//     const { body } = req;
//     // console.log(body);
//     const newTour = await Tour.create(body);
//     res.status(200).json({
//       status: "success",
//       result: 1,
//       data: {
//         tour: newTour,
//       },
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "error",
//       message: err,
//     });
//   }
// };
module.exports.createTour = createOne(Tour);

// get tour stats useing aggregate pipeline
module.exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    }, // one stage
    {
      $group: {
        // _id: "$ratingsAverage", // to group defend difficulty | ratingsAverage
        _id: { $toUpper: "$difficulty" },
        numTours: { $sum: 1 }, // sum +=1
        numRating: { $sum: "$ratingsQuantity" }, // sum all ratings quantity
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    }, // one stage
    {
      $sort: { avgPrice: 1 },
    },
    {
      $match: { _id: { $ne: "EASY" } },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

//
module.exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates", // trai array startDates
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), //filter from day to day
          $lt: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStats: { $sum: 1 },
        tours: { $push: "$name" },
      },
    },
    {
      $addFields: {
        // add more fields
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { _id: 1 },
    },
    {
      $limit: 5, // limit show
    },
  ]);

  res.status(200).json({
    status: "success",
    result: plan.length,
    data: {
      plan,
    },
  });
});

// router.get("/tours-within/:distance/center/:latlng/unit/:unit", getToursWithin);
// /tours-distance?distance=222&center=-40,45&unit=mi
// /tours-within/distance=222/latlng=-40,45/unit/mi
module.exports.getToursWithin = catchAsync(async (req, res) => {
  const { distance, latlng, unit } = req.params;
  // unit = mi or km

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    return res.status(400).json({
      status: "error",
      message: "Please provide latitude and longtitude in the format lat,lng",
    });

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: "success",
    result: tours.length,
    data: {
      tours,
    },
  });
});

module.exports.getDistance = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  // unit = mi or km

  const [lat, lng] = latlng.split(",");

  if (!lat || !lng)
    return next(
      new AppError(
        "Please provide latitude and longtitude in the format lat,lng",
        404
      )
    );

  //BUG dont find distances
  const distance = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: [lng * 1, lat * 1] },
        distanceField: "distance",
        spherical: true,
      },
    },
  ]);
  console.log(distance);

  res.status(200).json({
    status: "success",
    result: distance.length,
    data: {
      distance,
    },
  });
});
