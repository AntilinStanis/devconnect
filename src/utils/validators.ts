import { type Request } from "express";
import validator from "validator";

export const signUpValidator = function (req: Request) {

    if (Array.isArray(req?.body?.skills) && req?.body?.skills?.length > 10) {
        throw new Error("only 10 skills allowed");
    }
    else if (!validator.isStrongPassword(req?.body?.password)) {
        throw new Error("Please enter a strong password");
    }
    else {
        return true;
    }
};

export const updateValidator = function (req: Request) {

    const ALLOWED_UPDATE_FIELD = ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"];
    let updateData = req?.body;

    for (let [key, value] of Object.entries(updateData)) {

        if (!ALLOWED_UPDATE_FIELD.includes(key)) {
            throw new Error("update not allowed");
        }

        if (key === 'skills' && Array.isArray(value) && value.length > 10) throw new Error("only 10 skills allowed");

    }

    return true;
};

export const passwordValidator = function (req: Request) {

    if (!validator.isStrongPassword(req?.body?.password)) {
        throw new Error("Please enter a strong password");
    }
    else {
        return true;
    }
};

export default { signUpValidator, updateValidator, passwordValidator };