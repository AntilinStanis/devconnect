import CONFIG from "../../config/config.js";
import mongoose from "mongoose";

export const connection = async () => {    
    await mongoose.connect(CONFIG.DATABASE_URL!);
};