import jwt from "jsonwebtoken";
import ApiError from "../../../utils/ApiError.js";
import catchAsync from "../../../utils/catchAsync.js";
import Employer from "../models/Employer.js";
import Recruiter from "../models/Recruiter.js";

/**
 * protectEmployer – verifies the Bearer JWT and resolves either an Employer
 * (company owner) or a Recruiter (sub-user) account.
 *
 * Sets:
 *   req.user        – the Employer or Recruiter document
 *   req.accountType  – "employer" | "recruiter"
 *   req.employerId   – the Employer _id either way, so downstream services
 *                       never need to branch on account type
 */
const protectEmployer = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authentication required. Please login.");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired. Please login again.");
    }
    throw new ApiError(401, "Authentication failed. Please login again.");
  }

  if (!["employer", "recruiter"].includes(decoded.accountType)) {
    throw new ApiError(401, "Authentication failed. Please login again.");
  }

  let account;

  if (decoded.accountType === "employer") {
    account = await Employer.findById(decoded.id);
    if (!account) throw new ApiError(401, "Authentication failed. Please login again.");
    if (account.status === "suspended") throw new ApiError(403, "Your company account has been suspended.");
    if (account.status === "rejected") throw new ApiError(403, "Your company registration was rejected. Contact support.");

    req.employerId = account._id;
  } else {
    account = await Recruiter.findById(decoded.id);
    if (!account) throw new ApiError(401, "Authentication failed. Please login again.");
    if (account.status === "inactive") throw new ApiError(403, "Your recruiter account has been deactivated.");

    req.employerId = account.employer;
  }

  req.user = account;
  req.accountType = decoded.accountType;
  next();
});

/**
 * restrictTo(...types) – usage: restrictTo("employer") to block recruiters
 * from owner-only actions (e.g. deleting the company account).
 */
const restrictTo = (...types) => (req, res, next) => {
  if (!types.includes(req.accountType)) {
    return next(new ApiError(403, "You do not have permission to perform this action."));
  }
  next();
};

export { protectEmployer, restrictTo };
