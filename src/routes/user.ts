import express from 'express';
const router = express.Router();
import { authenticate } from "../middleware/auth.js";
import * as userController from "../controller/user.controller.js";

const POPULATE_USER_DATA = "firstName lastName age gender photoUrl about skills";

//getting all the pending connection requests for the logged in user
router.get('/request/received', authenticate, userController.getReceivedRequests);

//getting all the accepted connections of the logged in user
router.get('/connections', authenticate, userController.getConnections);

// deleting the connection request.
router.delete('/connections/:connectionId', authenticate, userController.deleteConnection);

// get all the users
router.get("/feed", authenticate, userController.getFeed);

export default { router };