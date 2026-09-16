const authMiddleware = (
  req,
  res,
  next
) => {
  /*
   * Temporary development authentication.
   *
   * Later this will be replaced with
   * Clerk token verification.
   */

  req.userId =
    "development-user";

  next();
};

module.exports =
  authMiddleware;