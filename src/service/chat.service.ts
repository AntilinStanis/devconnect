import Chat from "../model/chat.js";

export const getOrCreateChat = async (fromUserId: string, toUserId: string) => {
    // 1. Find existing chat between these two participants
    let chat = await Chat.findOne({
        participants: { $all: [fromUserId, toUserId] },
    }).populate({
        path: "messages.senderId",
        select: "firstName lastName"
    });

    // 2. If no chat exists, create a new one
    if (!chat) {
        chat = new Chat({
            participants: [fromUserId, toUserId],
            messages: []
        });
        await chat.save();
    }

    return chat;
};