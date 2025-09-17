/* eslint-disable lines-between-class-members */
/* eslint-disable prettier/prettier */
const matchquery = (query) => {
  const mongooseQuery = {};

  Object.entries(query).forEach(([key, rawValue]) => {
    const match = key.match(/^(.+)\[(.+)\]$/);

    if (match) {
      const field = match[1]; // e.g., "duration"
      const operator = match[2]; // e.g., "lte"
      const value = Number(rawValue); // convert string to number

      if (!mongooseQuery[field]) {
        mongooseQuery[field] = {};
      }

      mongooseQuery[field][`$${operator}`] = value;
    } else {
      mongooseQuery[key] = rawValue;
    }
  });

  return mongooseQuery; // { duration: { $lte: 5 } }
};

class API_FEATURES {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  filter() {
    const objectQuery = { ...this.queryStr };
    const excludedlist = ['page', 'sort', 'limit', 'fields'];

    excludedlist.forEach((el) => delete objectQuery[el]);
    const finalquery = matchquery(objectQuery);
    this.query.find(finalquery);

    return this;
  }
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      const sortedtour = this.query.sort(sortBy);
      this.query = sortedtour;
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }
  limitFields() {
    if (this.queryStr.fields) {
      const selectedFields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(selectedFields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = API_FEATURES;
