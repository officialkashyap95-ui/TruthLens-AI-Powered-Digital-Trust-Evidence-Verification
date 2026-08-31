const authMiddleware = (req, res, next) => {
  /*
   * Temporary development authentication.
   *
   * Clerk authentication will be added here next.
   */

  req.userId = "development-user";

  next();
};

module.exports = authMiddleware;