import mongoose, { Schema, Document, Types } from 'mongoose';

// Interface for the subdocument
export interface IMessage {
    senderId: Types.ObjectId;
    text: string;
    createdAt?: Date;
}

// Interface for the main document
export interface IChat extends Document {
    participants: Types.ObjectId[];
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });

const chatSchema = new Schema<IChat>({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    messages: [messageSchema]
}, { timestamps: true });

// Indexing for faster chat lookups
chatSchema.index({ participants: 1 });

const Chat = mongoose.model<IChat>("Chat", chatSchema);

export default Chat;