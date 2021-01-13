// class for refactor controller
class APIfeatures {
  constructor(query, queryString) {
    this.query = query; // query = Tour.find();
    this.queryString = queryString; // queryString = req.query
  }

  filter() {
    const queryObj = { ...this.queryString };
    //1] querry
    // ?duration=5
    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((el) => delete queryObj[el]);
    // delete fields === excludedfield note [el]

    // 2] addvance query
    // ?duration[lt]=5
    let queryStr = JSON.stringify(queryObj); // note let

    console.log("before replace:", queryStr);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log("after replace:", queryStr);

    this.query = this.query.find(JSON.parse(queryStr));
    // console.log(this.query);

    return this;
  }

  sort() {
    // 3] sorting
    // ?sort=field1,field2
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
      //sort('field1 field2')
    } else {
      this.query = this.query.sort("createdAt");
    }

    return this;
  }

  limitFields() {
    // 4] field limiting
    // ?fields=name,duration,difficulty,price
    // ?fields=-name,-duration => replace out result
    if (this.queryString.fields) {
      let fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__V");
    }

    return this;
  }

  paginate() {
    // 5] pagination page and limit
    //.skip(x).limit(limit)

    let page = this.queryString.page * 1 || 1;
    let limit = this.queryString.limit * 1 || 100;

    let skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIfeatures;
