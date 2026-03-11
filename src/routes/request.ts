import { Router } from "express";
const router = Router();
import { authenticate } from "../middleware/auth.js";
import * as requestController from "../controller/request.controller.js";

//sending a connection request to a user
router.post('/send/:status/:userId', authenticate, requestController.sendRequest);
// receiving a connection request from another user using the requestId of the connection.
// works only when the connection status between 2 users is interested.
router.post('/review/:status/:requestId', authenticate, requestController.reviewRequest);

export default { router };