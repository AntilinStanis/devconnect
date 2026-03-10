import { signUpValidator } from "../utils/validators.js";
import bcrypt from "bcrypt";
import User from "../model/user.js";
import CONFIG from "../../config/config.js";


const signUp = async (userData: any) => {
    // 1. Validation Logic
    if (!signUpValidator(userData)) {
        throw new Error("Validation error: Invalid input data");
    }

    // 2. Password Hashing
    const saltRounds = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // 3. Database Operation
    const user = new User({
        ...userData,
        password: hashedPassword,
    });

    const savedUser = await user.save();

    // 4. Token Generation
    const token = await savedUser.getJWT();

    return {
        user: savedUser,
        token: token,
        cookieMaxAge: Number(CONFIG.COOKIE_EXPIRATION)
    };
};

const login = async (emailId: string, password: string) => {
    const user = await User.findOne({ emailId });

    if (!user) {
        throw new Error("NO_USER_FOUND");
    }

    // validatePassword should be a method on your User model
    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
        throw new Error("INVALID_LOGIN");
    }

    const token = await user.getJWT();

    // Return only the necessary data to the controller
    return {
        token,
        user: {
            firstName: user.firstName,
            lastName: user.lastName,
            age: user.age,
            gender: user.gender,
            photoUrl: user.photoUrl,
            about: user.about,
            skills: user.skills,
            isPremium: user.isPremium,
        }
    };
};

export { signUp, login };