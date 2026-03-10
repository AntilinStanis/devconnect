import { type Request, type Response } from "express";
import express from 'express';
const router = express.Router();
import User from "../model/user.js";
import { authenticate } from "../middleware/auth.js";
import ConnectionRequest from "../model/connectionRequest.js";

const POPULATE_USER_DATA = "firstName lastName age gender photoUrl about skills";

//getting all the pending connection requests for the logged in user
router.get('/request/received', authenticate, async (req, res) => {
    try {

        let loggedInUser = req?.user?.id;

        if (!loggedInUser) {
            return res.status(401).json({ message: "Unauthorized: User ID missing" });
        };

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser,
            status: 'interested'
        }).populate("fromUserId", POPULATE_USER_DATA);

        res.status(200).json({ message: 'connection requests fetched successfully', connectionRequests: connectionRequests });

    } catch (err: any) {
        res.status(400).json({ "Error": err.message });
    }
});


//getting all the accepted connections of the logged in user
router.get('/connections', authenticate, async (req: Request, res: Response) => {
    try {
        const loggedInUser = req.user?.id;

        if (!loggedInUser) {
            return res.status(401).json({ message: "User not authenticated" });
        };

        const connectionRequests = await ConnectionRequest.find({
            status: 'accepted',
            $or: [
                { fromUserId: loggedInUser },
                { toUserId: loggedInUser }
            ]
        }).populate("fromUserId", POPULATE_USER_DATA).populate("toUserId", POPULATE_USER_DATA);

        const connectionData = connectionRequests.map((data: any) => {
            const connectionId = data._id;

            const isFromUser = data.fromUserId._id.toString() === loggedInUser.toString();

            const targetUser = isFromUser ? data.toUserId : data.fromUserId;

            return {
                ...targetUser.toObject(),
                connectionId
            };
        });

        res.status(200).json({ data: connectionData });

    } catch (err: any) {
        res.status(400).json({ message: err.message });
    };
});

// deleting the connection request.
router.delete('/connections/:connectionId', async (req, res) => {

    let connectionId = req?.params?.connectionId;

    try {

        const connections = await ConnectionRequest.deleteOne({ _id: connectionId });

        if (connections?.deletedCount === 1) {
            res.status(200).json({ message: "Connection delected successfully" });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// get all the users
router.get("/feed", authenticate, async (req: Request, res: Response) => {
    try {
        const loggedInUser = req.user?.id;
        if (!loggedInUser) {
            return res.status(401).json({ message: "User not authenticated" });
        };

        const hideUsers = new Set<string>();
        hideUsers.add(loggedInUser.toString());

        const connectionRequests = await ConnectionRequest.find({
            $or: [{ fromUserId: loggedInUser }, { toUserId: loggedInUser }]
        }).select("fromUserId toUserId");

        connectionRequests.forEach((request) => {
            hideUsers.add(request.fromUserId.toString());
            hideUsers.add(request.toUserId.toString());
        });

        const page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const users = await User.find({
            _id: { $nin: Array.from(hideUsers) }
        }).select("firstName lastName age gender photoUrl about skills").skip(skip).limit(limit);

        res.status(200).json({ data: users });

    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = { router };