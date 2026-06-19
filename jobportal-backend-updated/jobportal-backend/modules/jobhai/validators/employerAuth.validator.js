import { body } from "express-validator";

const registerEmployerValidator = [
  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("ownerName").trim().notEmpty().withMessage("Owner name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Valid 10-digit phone number is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("city").optional().trim(),
  body("industry").optional().trim(),
  body("companySize")
    .optional()
    .isIn(["1-10", "11-50", "51-200", "201-500", "500+"])
    .withMessage("Invalid company size"),
  body("gstNumber").optional().trim(),
];

const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export { registerEmployerValidator, loginValidator };
