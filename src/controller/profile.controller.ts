import type { Request, Response } from "express";
import * as profileService from "../service/profile.service.js";
import { updateValidator, passwordValidator } from "../utils/validators.js";

export const viewProfile = async (req: Request, res: Response) => {
    try {
        const user = await profileService.viewProfile(req.user?.id!);
        res.json({ success: true, user });
    } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
    }
};

export const editProfile = async (req: Request, res: Response) => {
    try {
        if (!updateValidator(req)) throw new Error("Invalid edit request");

        const user = await profileService.editProfile(req.user?.id!, req.body);
        res.json({ success: true, user });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { emailId } = req.body;
        await profileService.forgotPassword(emailId);
        res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (typeof token !== 'string') throw new Error("Invalid token");
        if (!passwordValidator(req)) throw new Error("Please enter a strong password");

        await profileService.resetPassword(token, password);
        res.status(200).json({ message: "Password reset successful" });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};