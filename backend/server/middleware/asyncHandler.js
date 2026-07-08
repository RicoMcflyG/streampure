// backend/server/middleware/asyncHandler.js
//
// Express 4 doesn't forward a rejected promise from an async route handler
// to the error-handling middleware on its own — an uncaught rejection just
// leaves the request hanging. Wrap any async handler with this so DB
// errors (Mongoose timeouts, etc.) turn into a proper JSON 500 instead of a
// silent hang.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
