import ConnectionRequest from '../model/connectionRequest.js';
import User from "../model/user.js";
import * as sendMail from "../utils/sendMail.js";

export const sendConnectionRequest = async (fromUserId: string, toUserId: string, status: string) => {
    const validStatus = ["interested", "ignored"];
    if (!validStatus.includes(status)) {
        throw new Error("Invalid status: " + status);
    }

    // 1. Validate Target User
    const toUser = await User.findById(toUserId);
    if (!toUser) throw new Error("User not found");

    // 2. Prevent self-requests
    if (fromUserId === toUserId) {
        throw new Error("Cannot send request to yourself");
    }

    // 3. Check for existing request (mutual check)
    const existingRequest = await ConnectionRequest.findOne({
        $or: [
            { fromUserId, toUserId },
            { fromUserId: toUserId, toUserId: fromUserId }
        ]
    });

    if (existingRequest) throw new Error("Connection request already exists");

    // 4. Save Request
    const connectionRequest = new ConnectionRequest({ fromUserId, toUserId, status });
    const data = await connectionRequest.save();

    // 5. Trigger Email if 'interested'
    if (status === "interested") {
        await sendMail.run({ subject: 'connection request send sucessfully', body: `Connection request sent to ${toUser.firstName + ' ' + toUser.lastName}` });
    }

    return ConnectionRequest.findById(data._id)
        .populate("toUserId", "firstName lastName age gender photoUrl about skills");
};

export const reviewConnectionRequest = async (loggedInUser: string, requestId: string, status: string) => {
    const validStatuses = ['accepted', 'rejected'] as const;

    if (!(validStatuses as unknown as string[]).includes(status)) {
        throw new Error("Invalid status");
    }

    const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser,
        status: 'interested'
    });

    if (!connectionRequest) throw new Error("Connection request not found");

    connectionRequest.status = status as "accepted" | "rejected";

    connectionRequest.modifiedAt = new Date();

    return await connectionRequest.save();
};