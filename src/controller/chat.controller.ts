import type{ Request, Response } from "express";
import * as chatService from "../service/chat.service.js";

export const getChatMessages = async (req: Request, res: Response) => {
    try {
        const fromUserId = req.user?.id;
        const { toUserId } = req.params;

        if (typeof toUserId !== 'string') {
            return res.status(400).json({ error: "Invalid recipient ID" });
        }

        if (!fromUserId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const chat = await chatService.getOrCreateChat(fromUserId, toUserId);

        res.status(200).json(chat);
    } catch (error: any) {
        console.error("Error fetching chat: ", error.message);
        res.status(500).json({ error: "Failed to fetch chat messages." });
    }
};