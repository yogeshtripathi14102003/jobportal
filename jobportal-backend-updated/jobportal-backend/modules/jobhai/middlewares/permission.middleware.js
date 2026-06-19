import ApiError from "../../../utils/ApiError.js";

const requirePermission = (permissionKey) => (req, res, next) => {
  if (req.accountType === "employer") return next();

  if (req.accountType === "recruiter" && req.user.permissions?.[permissionKey]) {
    return next();
  }

  return next(new ApiError(403, "You do not have permission to perform this action."));
};

export default requirePermission;
