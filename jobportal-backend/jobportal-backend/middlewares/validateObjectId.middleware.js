import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

/**
 * Validates that req.params[paramName] is a valid Mongo ObjectId.
 * Usage:
 * router.get("/:id", validateObjectId("id"), controllerFn)
 */
function validateObjectId(paramName = "id") {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(
        new ApiError(400, `Invalid ${paramName}: ${value}`)
      );
    }

    next();
  };
}

export default validateObjectId;