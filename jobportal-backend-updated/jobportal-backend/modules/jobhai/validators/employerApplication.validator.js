import { body } from "express-validator";

const updateApplicationStatusValidator = [
  body("status")
    .isIn(["applied", "shortlisted", "interview_scheduled", "rejected", "hired"])
    .withMessage("Invalid status"),
  body("rejectionReason").optional().trim(),
  body("interviewDetails.scheduledAt").optional().isISO8601().withMessage("Invalid interview date"),
  body("interviewDetails.mode")
    .optional()
    .isIn(["in_person", "phone", "video"])
    .withMessage("Invalid interview mode"),
  body("interviewDetails.location").optional().trim(),
  body("interviewDetails.notes").optional().trim(),
];

export { updateApplicationStatusValidator };
