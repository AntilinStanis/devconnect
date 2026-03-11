import User from "../model/user.js";
import CONFIG from "../../config/config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as CommonMiddleware from "../middleware/common.js";

export const viewProfile = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new Error("NO USER FOUND");
    return user;
};

export const editProfile = async (userId: string, updateData: any) => {
    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { returnDocument: 'after', runValidators: true }
    ).select("-password");

    if (!user) throw new Error("User not found");
    return user;
};

export const forgotPassword = async (emailId: string) => {
    const user = await User.findOne({ emailId });
    if (!user) throw new Error("User not found");

    const resetToken = await user.getResetToken();
    const resetLink = `http://localhost:4500/reset-password/${resetToken}`;

    const mailOptions = {
        from: `DEV-CONNECT <${CONFIG.USER_MAIL}>`,
        to: emailId,
        subject: "Password Reset Request",
        html: `<p>Click the button below to reset your password:</p>
                   <a href="${resetLink}" style="padding: 10px; background: #007bff; color: #fff; text-decoration: none;">Reset Password</a>`
    };

    const transporter = await CommonMiddleware.createTransporter();

    await CommonMiddleware.sendMail(transporter, mailOptions);

    return true;
};

export const resetPassword = async (token: string, newPassword: string) => {
    // 1. Verify Token
    const decoded = jwt.verify(token, CONFIG.JWT_FORGOT_PASSWORD_KEY!) as jwt.JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    // 2. Hash and Save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return true;
};