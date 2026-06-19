import express from "express";
import * as profileController from "../controllers/employerProfile.controller.js";
import { protectEmployer, restrictTo } from "../middlewares/employerAuth.middleware.js";
import { logoUpload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(protectEmployer);

router.get("/", profileController.getMyProfile);
router.patch("/", restrictTo("employer"), profileController.updateMyProfile);
router.post("/logo", restrictTo("employer"), logoUpload.single("logo"), profileController.uploadLogo);

export default router;
