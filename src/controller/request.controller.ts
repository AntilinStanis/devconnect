import type { Request, Response } from "express";
import * as requestService from "../service/request.service.js";

export const sendRequest = async (req: Request, res: Response) => {
    try {
        const { status, userId: toUserId } = req.params;
        const fromUserId = req.user?.id;

        if (!fromUserId) throw new Error("Unauthorized");

        if (!toUserId || typeof toUserId !== 'string') {
            return res.status(400).json({ error: "Invalid User ID provided" });
        }

        if (!status || typeof status !== 'string') {
            return res.status(400).json({ error: "Invalid status provided" });
        };

        const data = await requestService.sendConnectionRequest(fromUserId, toUserId, status);

        return res.json({ msg: "Request Data added successfully", data });
    } catch (err: any) {
        return res.status(400).json({ Error: err.message });
    };
};

export const reviewRequest = async (req: Request, res: Response) => {
    try {
        const { status, requestId } = req.params;
        const loggedInUser = req.user?.id;

        if (!loggedInUser) throw new Error("Unauthorized");

        if (typeof requestId !== 'string' || typeof status !== 'string') {
            return res.status(400).json({ error: "Invalid Request ID or Status" });
        };

        const connection = await requestService.reviewConnectionRequest(loggedInUser, requestId, status);

        return res.json({ message: `Connection ${status} successfully`, connection });
    } catch (err: any) {
        return res.status(400).json({ Error: err.message });
    }
};