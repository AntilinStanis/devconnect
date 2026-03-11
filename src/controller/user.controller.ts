import type { Request, Response } from "express";
import * as userService from "../service/user.service.js";

export const getReceivedRequests = async (req: Request, res: Response) => {
    try {
        const data = await userService.getReceivedRequests(req.user?.id!);
        res.status(200).json({ message: 'Requests fetched successfully', data });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getConnections = async (req: Request, res: Response) => {
    try {
        const data = await userService.getConnections(req.user?.id!);
        res.status(200).json({ data });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteConnection = async (req: Request, res: Response) => {
    try {
        const { connectionId } = req.params;
        if (typeof connectionId !== 'string') {
            return res.status(400).json({ message: "Invalid or missing connectionId" });
        };
        await userService.deleteConnection(connectionId);
        res.status(200).json({ message: "Connection deleted successfully" });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getFeed = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        let limit = parseInt(req.query.limit as string) || 10;
        limit = limit > 50 ? 50 : limit;

        const users = await userService.getFeed(req.user?.id!, page, limit);
        res.status(200).json({ data: users });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};