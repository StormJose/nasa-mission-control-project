const DEFAULT_FLIGHT_NUMBER = 1;
const DEFAULT_PAGE_LIMIT = 0;

const getPagination = function (query) {
  // getting the absolute limit
  const page = Math.abs(query.page) || DEFAULT_FLIGHT_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  // skip pages formula.
  const skip = (page - 1) * limit;

  return {
    skip,
    limit,
  };
};

module.exports = {
  getPagination,
};
