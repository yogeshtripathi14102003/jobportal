import jwt from "jsonwebtoken";
import Employer from "../models/Employer.js";
import Recruiter from "../models/Recruiter.js";
import ApiError from "../../../utils/ApiError.js";

const signAccess = (id, accountType) =>
  jwt.sign({ id, accountType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const signRefresh = (id, accountType) =>
  jwt.sign({ id, accountType }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });

/**
 * Register a new company (employer owner account).
 * Status starts as "pending" (set by the schema default) until an admin verifies it.
 */
async function registerEmployer(data) {
  const { companyName, ownerName, email, phone, password, city, industry, companySize, gstNumber } = data;

  const existing = await Employer.findOne({ $or: [{ email }, { phone }] });
  if (existing) throw new ApiError(409, "An employer account with this email or phone already exists");

  const employer = await Employer.create({
    companyName,
    ownerName,
    email,
    phone,
    password,
    city,
    industry,
    companySize,
    gstNumber,
  });

  const accessToken = signAccess(employer._id, "employer");
  const refreshToken = signRefresh(employer._id, "employer");

  employer.refreshToken = refreshToken;
  await employer.save({ validateBeforeSave: false });

  return { employer: employer.toJSON(), accessToken, refreshToken };
}

/**
 * Login for either the company owner (Employer) or a sub-user (Recruiter).
 * Tries Employer first, falls back to Recruiter.
 */
async function login(email, password) {
  let account = await Employer.findOne({ email }).select("+password");
  let accountType = "employer";

  if (!account) {
    account = await Recruiter.findOne({ email }).select("+password");
    accountType = "recruiter";
  }

  if (!account) throw new ApiError(401, "Invalid email or password");

  const isMatch = await account.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  if (accountType === "employer") {
    if (account.status === "suspended") throw new ApiError(403, "Your company account has been suspended");
    if (account.status === "rejected") throw new ApiError(403, "Your company registration was rejected. Please contact support");
  } else if (account.status === "inactive") {
    throw new ApiError(403, "Your recruiter account has been deactivated");
  }

  const accessToken = signAccess(account._id, accountType);
  const refreshToken = signRefresh(account._id, accountType);

  account.refreshToken = refreshToken;
  account.lastLoginAt = new Date();
  await account.save({ validateBeforeSave: false });

  return { account: account.toJSON(), accountType, accessToken, refreshToken };
}

async function refreshTokens(incomingRefresh) {
  if (!incomingRefresh) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(incomingRefresh, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const Model = decoded.accountType === "recruiter" ? Recruiter : Employer;
  const account = await Model.findById(decoded.id).select("+refreshToken");

  if (!account || account.refreshToken !== incomingRefresh) {
    throw new ApiError(401, "Refresh token mismatch. Please login again.");
  }

  const accessToken = signAccess(account._id, decoded.accountType);
  const refreshToken = signRefresh(account._id, decoded.accountType);

  account.refreshToken = refreshToken;
  await account.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
}

async function logout(accountId, accountType) {
  const Model = accountType === "recruiter" ? Recruiter : Employer;
  await Model.findByIdAndUpdate(accountId, { $unset: { refreshToken: 1 } });
}

export { registerEmployer, login, refreshTokens, logout };
