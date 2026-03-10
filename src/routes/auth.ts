import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as authController from "../controller/auth.controller.js";

const router = Router();

// new create request
router.post("/signup", authController.signup);

// Authentication of user by email,password and ending back jwt token
router.post("/login", authController.login);

// log out from application
router.post("/logout", authenticate, authController.logout);

export default { router };
