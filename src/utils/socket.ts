import { Server as SocketServer } from "socket.io";
import crypto from "crypto";
import Chat from "../model/chat.js";
import ConnectionRequest from "../model/connectionRequest.js";
import http from "http";

// Helper to create a consistent room ID for two users
const getSecretRoomId = (userId: string, toUserId: string): string => {
    return crypto
        .createHash("sha256")
        .update([userId, toUserId].sort().join('_'))
        .digest("hex");
};

export const initializeSocket = (server: http.Server) => {
    const io = new SocketServer(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {

        // 1. Join Chat Room
        socket.on("joinChat", ({ firstName, userId, toUserId }) => {
            const roomId = getSecretRoomId(userId, toUserId);
            console.log(`${firstName} joined room: ${roomId}`);
            socket.join(roomId);
        });

        // 2. Send and Save Message
        socket.on("sendMessage", async ({ firstName, lastName, userId, toUserId, text }) => {
            try {
                const roomId = getSecretRoomId(userId, toUserId);

                // Check for existing connection (Business logic verification)
                let connection = await ConnectionRequest.findOne({
                    $or: [
                        { fromUserId: userId, toUserId: toUserId },
                        { fromUserId: toUserId, toUserId: userId }
                    ]
                });

                // Auto-accept connection if it doesn't exist (as per your logic)
                if (!connection) {
                    connection = new ConnectionRequest({
                        fromUserId: userId,
                        toUserId: toUserId,
                        status: "accepted"
                    });
                    await connection.save();
                }

                // Find or Create Chat Document
                let chat = await Chat.findOne({
                    participants: { $all: [userId, toUserId] }
                });

                if (!chat) {
                    chat = new Chat({
                        participants: [userId, toUserId],
                        messages: []
                    });
                }

                // Push message to subdocument array
                chat.messages.push({ senderId: userId, text });
                await chat.save();

                // Broadcast to everyone in the room (including sender)
                io.to(roomId).emit("messageReceived", { firstName, lastName, text, userId });

            } catch (error: any) {
                console.error("Socket Error:", error.message);
                socket.emit("error", { message: "Internal server error sending message." });
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected: ", socket.id);
        });
    });
};