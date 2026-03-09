import mongoose, { Schema, Document, Model, type CallbackWithoutResultAndOptionalError, type HydratedDocument } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import CONFIG from "../../config/config.js";
import type { NextFunction } from "express";

// 1. Define an Interface for the User Document
// This tells TypeScript exactly what methods and properties a "User" has.
export interface IUser extends Document {
    firstName: string;
    lastName: string;
    emailId: string;
    password?: string;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    isPremium: boolean;
    membershipType?: string;
    photoUrl: string;
    about: string;
    skills: string[];
    createdAt: Date;
    modifiedAt: Date;
    // Define Instance Methods
    getJWT(): Promise<string>;
    validatePassword(userPassword: string): Promise<boolean>;
    getResetToken(): Promise<string>;
}

const userSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    emailId: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
        validate(value: string) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email: " + value);
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value: string) {
            // Fix: Cast to string or ensure options match validator expectations
            if (!validator.isStrongPassword(value)) {
                throw new Error("Not a strong password: " + value);
            }
        }
    },
    age: { type: Number, min: 18 },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'other'],
            message: `{VALUE} must be valid`
        }
    },
    isPremium: { type: Boolean, default: false },
    membershipType: { type: String },
    photoUrl: {
        type: String,
        default: "https://www.svgrepo.com/show/350417/user-circle.svg",
        validate(value: string) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid Url: " + value);
            }
        }
    },
    about: { type: String, default: "This is the default about" },
    skills: {
        type: [String],
        validate(value: string[]) {
            if (!Array.isArray(value)) {
                throw new Error("Skills should be an array");
            }
        }
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date, default: Date.now }
});

// 2. Instance methods implementation
userSchema.methods.getJWT = async function (this: IUser) {
    return jwt.sign({ id: this._id }, CONFIG.JWT_SECRET_KEY!, { 
        expiresIn: CONFIG.JWT_EXPIRATION as any
    });
};

userSchema.methods.validatePassword = async function (this: IUser, userPassword: string) {
    return await bcrypt.compare(userPassword, this.password || "");
};

userSchema.methods.getResetToken = async function (this: IUser) {
    return jwt.sign({ id: this._id }, CONFIG.JWT_FORGOT_PASSWORD_KEY!, { 
        expiresIn: CONFIG.JWT_FORGOT_PASSWORD_EXPIRATION as any
    });
};

// 3. Pre-save middleware
userSchema.pre('save', function (this: HydratedDocument<IUser>) {
  this.modifiedAt = new Date();
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;