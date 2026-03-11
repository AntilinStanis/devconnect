import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import * as chatController from "../controller/chat.controller.js";

const router = Router();

router.get("/:toUserId", authenticate, chatController.getChatMessages);

export default { router };