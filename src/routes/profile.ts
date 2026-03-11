import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as profileController from "../controller/profile.controller.js";

const router = Router();

// --- View Profile ---
router.get("/view", authenticate, profileController.viewProfile);

// --- Edit Profile ---
router.patch("/edit", authenticate, profileController.editProfile);

// --- Forgot Password ---
router.post("/forgotpassword", profileController.forgotPassword);

// --- Reset Password ---
router.patch("/resetpassword/:token", profileController.resetPassword);

export default { router };