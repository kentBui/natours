const mongoose = require("mongoose");
const validator = require("validator");
// const User = require("./user.model");

const toursSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have name"],
      unique: true,
      trim: true,
      maxlength: [30, "A name must have less or equal 30 chareactors"],
      minlength: [4, "A name must have more or equal 4 charactors"],
      // validate: [validator.isAlpha, "Tour name must only contain letter"],
      //a-zA-Z no contain _ => no use validator, need use express-validator
    },
    slug: {
      type: String,
    },
    duration: {
      type: Number,
      required: [true, "A tour must have duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have max group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have difficulty"],
      enum: {
        values: ["easy", "difficult", "medium"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      required: true,
      max: 5,
      min: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // validation func
          return val < this.price;
          // this only points to current doc on New Document creation
        },
        message: "Discount price must be less than regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
  { timestamps: true }
);

// toursSchema.pre("save", async function (next) {
//   const guidesPromise = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);
//   next();
// });

// create indexes
// toursSchema.index({ price: 1 });
toursSchema.index({ price: 1, ratingsAverage: -1 });
toursSchema.index({ slug: 1 });
toursSchema.index({ startLocation: "2dsphere" });
// toursSchema.index({ near: "2dsphere" });

toursSchema.virtual("durationWeeks").get(function () {
  // use real function, not use arrow func
  return this.duration / 7;
});

// virtual populate
toursSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
});

//document middleware: runs befor .save() and .create()
toursSchema.pre("save", function (next) {
  // this.slug=slugify(this.name,{lower: true});
  next();
});

toursSchema.pre("save", function (next) {
  console.log("will save document");
  next();
});

toursSchema.post("save", function (doc) {
  console.log(doc);
});

// query middleware
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now(); // start time to find
  next();
});

toursSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

toursSchema.post(/^find/, function (doc) {
  // console.log(doc);
  console.log(`Query took ${Date.now() - this.start} milisecons`);
});

// aggregation middleware
// toursSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   // add $match = condition
//   console.log(this.pipeline());
//   next();
// });

module.exports = mongoose.model("Tour", toursSchema);
