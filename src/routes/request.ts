import type { Request, Response } from "express";
import express from "express";
import { signUpValidator } from "../utils/validators.js";
import bcrypt from "bcrypt";
import User from "../model/user.js";
import { authenticate } from "../middleware/auth.js";
const router = express.Router();
import CONFIG from "../../config/config.js";


// new create request
router.post("/signup", async (req: Request, res: Response) => {

    if (req?.body) {

        try {

            if (signUpValidator(req)) {

                let saltRounds = Math.floor(Math.random() * (12 - 8 + 1)) + 8; // generate random saltrounds between 8 - 12 to create unique password for every user. 

                let salt = await bcrypt.genSalt(saltRounds);
                const hashedPassword = await bcrypt.hash(req?.body?.password, salt);

                // create a new instance of User model
                const user = new User({
                    firstName: req?.body?.firstName,
                    lastName: req?.body?.lastName,
                    emailId: req?.body?.emailId,
                    password: hashedPassword,
                    age: req?.body?.age ?? null,
                    gender: req?.body?.gender ?? null,
                    photoUrl: req?.body?.photoUrl,
                    about: req?.body?.about,
                    skills: req?.body?.skills ?? []
                });

                // save the data 
                const savedUser = await user.save();
                const token = await savedUser.getJWT();

                res.cookie("authorizationToken", token, { maxAge: Number(CONFIG.COOKIE_EXPIRATION), httpOnly: true, sameSite: "strict" });

                res.status(200).json({ message: "user added successfully", User: savedUser });
            }
            else {
                throw new Error("Validation error");
            }
        }
        catch (err: any) {
            res.status(400).json({ Error: "error in creating user : " + err.message });
        }
    }
    else {
        throw new Error("DATA_NOT_RECIEVED");
    }
});

// Authentication of user by email,password and ending back jwt token
router.post("/login", async (req, res) => {

    console.log({ INFO: "log in function called" });

    if (req?.body) {

        try {

            let user = await User.findOne({ emailId: req?.body?.emailId });

            if (!user) throw new Error("NO_USER_FOUND");

            if (user?.password) {

                let isValidPassword = await user.validatePassword(req?.body?.password);

                if (!isValidPassword) throw new Error("INVALID_LOGIN");

                if (isValidPassword) {

                    const token = await user.getJWT();

                    res.cookie("authorizationToken", token, { maxAge: Number(CONFIG.COOKIE_EXPIRATION), httpOnly: true, sameSite: "strict" });

                    let userData = { firstName: user.firstName, lastName: user.lastName, age: user.age, gender: user.gender, photoUrl: user.photoUrl, about: user.about, skills: user.skills, isPremium: user.isPremium };

                    res.json({ message: "signin successful", user: userData });
                }
            }
            else {
                throw new Error("NO_USER_FOUND");
            }
        }
        catch (err: any) {
            res.status(400).json({ Error: err.message });
        }
    }
    else {
        res.status(400).json({ message: "REQUEST_BODY_REQUIRED" });
    }
});

// log out from application
router.post("/logout", authenticate, async (req: Request, res: Response) => {
    console.log({ INFO: "logout function called" });
    res.clearCookie("authorizationToken");
    res.status(200).json({ message: "logged out successfully..." });
});

export default { router };