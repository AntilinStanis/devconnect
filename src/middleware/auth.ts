import { type NextFunction, type Request, type Response } from "express";
import jwt from "jsonwebtoken"; // Changed from * as jwt
import CONFIG from "../../config/config.js";
import User, { type IUser } from "../model/user.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUser; 
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract token from cookies or Bearer header
        let token = req.cookies?.authorizationToken || req.headers.authorization;

        // Handle "Bearer <token>" format if present in headers
        if (token?.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }

        if (!token) {
            return res.status(401).send('Unauthorized! Please login');
        }

        // 2. Verify and cast the payload
        const decoded = jwt.verify(token, CONFIG.JWT_SECRET_KEY!) as jwt.JwtPayload;

        if (!decoded || !decoded.id) {
            throw new Error("AUTHENTICATION_FAILED");
        }

        // 3. Find the user in DB
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error("USER_NOT_FOUND");
        }

        // 4. Attach the full Mongoose user object to the request
        req.user = user; 
        next();

    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};