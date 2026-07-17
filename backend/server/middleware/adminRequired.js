// backend/server/middleware/adminRequired.js
//
// Chain after authRequired on any route that only the catalog admin(s)
// should be able to hit (uploading/deleting tracks in the public catalog).
// authRequired must run first so req.user is already populated.
function adminRequired(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

module.exports = { adminRequired };
