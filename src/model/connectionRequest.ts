import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', //refernce to user collection
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["accepted", "rejected", "ignored", "interested"],
            message: `{VALUE} is incorrect type`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

// compund index : creating multiple indexes.
// reduces time when searching for user ids.
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// pre middleware to check if the from userId and to userId are same ie) if the user tries to send connection request to themselves
// beforeSave
connectionRequestSchema.pre('save', function (next) {

    const connectionRequest = this;

    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("cannot send request to yourself!!");
    }

    // next();
})

const ConnectionRequest = mongoose.model("connectionRequest", connectionRequestSchema);

export default ConnectionRequest;