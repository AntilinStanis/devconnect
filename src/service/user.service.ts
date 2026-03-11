import ConnectionRequest from "../model/connectionRequest.js";
import User from "../model/user.js";

const POPULATE_USER_DATA = "firstName lastName age gender photoUrl about skills";

export const getReceivedRequests = async (loggedInUser: string) => {
    return await ConnectionRequest.find({
        toUserId: loggedInUser,
        status: 'interested'
    }).populate("fromUserId", POPULATE_USER_DATA);
};

export const getConnections = async (loggedInUser: string) => {
    const connectionRequests = await ConnectionRequest.find({
        status: 'accepted',
        $or: [
            { fromUserId: loggedInUser },
            { toUserId: loggedInUser }
        ]
    }).populate("fromUserId", POPULATE_USER_DATA).populate("toUserId", POPULATE_USER_DATA);

    // Transform data to return the "other" person's profile
    return connectionRequests.map((data: any) => {
        const isFromUser = data.fromUserId._id.toString() === loggedInUser.toString();
        const targetUser = isFromUser ? data.toUserId : data.fromUserId;
        return {
            ...targetUser.toObject(),
            connectionId: data._id
        };
    });
};

export const deleteConnection = async (connectionId: string) => {
    const result = await ConnectionRequest.deleteOne({ _id: connectionId });
    if (result.deletedCount === 0) throw new Error("Connection not found");
    return true;
};

export const getFeed = async (loggedInUser: string, page: number, limit: number) => {
    const skip = (page - 1) * limit;

    // Find all users to hide (self + anyone with a request)
    const hideUsers = new Set<string>();
    hideUsers.add(loggedInUser.toString());

    const connectionRequests = await ConnectionRequest.find({
        $or: [{ fromUserId: loggedInUser }, { toUserId: loggedInUser }]
    }).select("fromUserId toUserId");

    connectionRequests.forEach((request) => {
        hideUsers.add(request.fromUserId.toString());
        hideUsers.add(request.toUserId.toString());
    });

    return await User.find({
        _id: { $nin: Array.from(hideUsers) }
    })
    .select(POPULATE_USER_DATA)
    .skip(skip)
    .limit(limit);
};