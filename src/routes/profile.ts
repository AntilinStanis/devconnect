import { type Request, type Response, Router } from "express";
import CONFIG from "../../config/config.js";
import { authenticate } from "../middleware/auth.js";
import User, { type IUser } from "../model/user.js";
import { updateValidator, passwordValidator } from "../utils/validators.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as CommonMiddleware from "../middleware/common.js";

const router = Router();

declare global {
  namespace Express {
    interface Request {
      user?: IUser; 
    }
  }
};

// --- View Profile ---
router.get("/view", authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const userProfile = await User.findById(userId).select("-password"); // Security: Don't fetch password

        if (!userProfile) {
            return res.status(404).json({ success: false, message: "NO USER FOUND" });
        }

        res.json({ success: true, user: userProfile });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// --- Edit Profile ---
router.patch("/edit", authenticate, async (req: Request, res: Response) => {
    try {
        if (!updateValidator(req)) {
            throw new Error("Invalid edit request");
        }

        const userId = req.user?.id;
        const updateData = req.body;

        // Use findByIdAndUpdate to get the fresh document
        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { returnDocument: 'after', runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- Forgot Password ---
router.post("/forgotpassword", async (req: Request, res: Response) => {
    try {
        const { emailId } = req.body;
        const user = await User.findOne({ emailId });

        if (!user) throw new Error("User not found");

        const resetToken = await user.getResetToken();
        const resetLink = `http://localhost:4500/profile/resetpassword/${resetToken}`;

        const transporter = await CommonMiddleware.createTransporter();

        const mailOptions = {
            from: `DEV-CONNECT <${CONFIG.USER_MAIL}>`,
            to: emailId, // Use the user's actual email!
            subject: "Password Reset Request",
            html: `<p>Click the button below to reset your password:</p>
                   <a href="${resetLink}" style="padding: 10px; background: #007bff; color: #fff; text-decoration: none;">Reset Password</a>`
        };

        await CommonMiddleware.sendMail(transporter, mailOptions);
        res.status(200).json({ message: "Password reset link sent to your email" });

    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// --- Reset Password ---
router.patch("/resetpassword/:token", async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || typeof token !== 'string') {
            throw new Error("Invalid or missing token");
        };

        const decoded = jwt.verify(token, CONFIG.JWT_FORGOT_PASSWORD_KEY!) as jwt.JwtPayload;
        const user = await User.findById(decoded.id);

        if (!user) throw new Error("User not found");

        if (!passwordValidator(req)) throw new Error("Please enter a strong password");

        // Hash and Save
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default { router };