import User from "../models/JobPortalUser.js";
import ApiError from "../../../utils/ApiError.js";
import {
  getPagination,
  buildPaginatedResponse,
} from "../../../utils/pagination.js";
/**
 * Get paginated list of users with search & filters
 * @param {Object} query - req.query (search, status, city, page, limit)
 */
async function getUsers(query) {
  const { page, limit, skip } = getPagination(query);
  const { search, status, city, role } = query;

  const filter = {};

  if (status) filter.status = status;
  if (city) filter.city = new RegExp(city, 'i');
  if (role) filter.role = role;

  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return buildPaginatedResponse(users, total, page, limit);
}

/**
 * Get a single user by ID
 */
async function getUserById(userId) {
  const user = await User.findById(userId).lean();
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

/**
 * Update a user's editable fields (admin context)
 */
async function updateUser(userId, updateData) {
  // Whitelist fields admin is allowed to edit directly
  const allowedFields = [
    'name',
    'email',
    'phone',
    'city',
    'skills',
    'education',
    'experienceYears',
  ];
  const sanitizedData = {};
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) sanitizedData[field] = updateData[field];
  }

  const user = await User.findByIdAndUpdate(userId, sanitizedData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

/**
 * Block a user with a reason
 */
async function blockUser(userId, reason) {
  const user = await User.findByIdAndUpdate(
    userId,
    { status: 'blocked', blockedReason: reason || 'Violation of platform policy' },
    { new: true }
  ).lean();

  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

/**
 * Unblock a user
 */
async function unblockUser(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { status: 'active', blockedReason: null },
    { new: true }
  ).lean();

  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

/**
 * Delete a user permanently
 */
async function deleteUser(userId) {
  const user = await User.findByIdAndDelete(userId).lean();
  if (!user) throw new ApiError(404, 'User not found');
  return user;
}

/**
 * Get summary stats for users (used in admin dashboard)
 */
async function getUserStats() {
  const [total, active, blocked, newThisMonth] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', status: 'active' }),
    User.countDocuments({ role: 'user', status: 'blocked' }),
    User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(new Date().setDate(1)) }, // start of current month
    }),
  ]);

  return { total, active, blocked, newThisMonth };
}

export {
  getUsers,
  getUserById,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
  getUserStats,
};
