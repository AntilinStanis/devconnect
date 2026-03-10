import CONFIG from "../../config/config.js";
import * as authService from "../service/auth.service.js";
import type { Request, Response } from "express";

const signup = async (req: Request, res: Response) => {
    try {
        // The service handles the heavy lifting
        const result = await authService.signUp(req.body);

        // Set the cookie (if your service returns the token)
        res.cookie("authorizationToken", result.token, {
            maxAge: Number(result.cookieMaxAge),
            httpOnly: true,
            sameSite: "strict",
        });

        return res.status(201).json({
            message: "User added successfully",
            user: result.user
        });
    } catch (error: any) {
        return res.status(400).json({
            error: "Error in creating user: " + error.message
        });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { emailId, password } = req.body;

        if (!emailId || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Call the service to handle logic
        const { user, token } = await authService.login(emailId, password);

        // Set the secure cookie
        res.cookie("authorizationToken", token, {
            maxAge: Number(CONFIG.COOKIE_EXPIRATION),
            httpOnly: true,
            sameSite: "strict",
            // secure: true, // Enable this in production with HTTPS
        });

        // Return the filtered user data
        return res.status(200).json({
            message: "Signin successful",
            user
        });

    } catch (err: any) {
        const statusCode = err.message === "NO_USER_FOUND" || err.message === "INVALID_LOGIN" ? 401 : 400;
        return res.status(statusCode).json({ error: err.message });
    };
};

const logout = async (req: Request, res: Response) => {
    try {
        // Clear the cookie by name
        res.clearCookie("authorizationToken", {
            httpOnly: true,
            sameSite: "strict",
            // secure: true, // Match the settings used during login
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err: any) {
        return res.status(500).json({
            success: false,
            error: "Logout failed: " + err.message
        });
    }
};

export { signup, login, logout };