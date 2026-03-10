import express, { type Application } from 'express';
import { connection } from "./model/index.js";
import CONFIG from "../config/config.js";
import cookieParser from "cookie-parser";
import http from "http";

import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/request.js";
import profileRoutes from "./routes/profile.js";
import userRequestRouter from "./routes/request.js";

const server = http.createServer();
const app: Application = express();


app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes.router);
app.use("/request", requestRoutes.router);
app.use("/profile", profileRoutes.router);
app.use('/user', userRequestRouter.router);

connection().then(() => {
    console.log("successfully connected to the database...");
    server.listen(CONFIG.APP_PORT || 3000, () => {
        console.log(`server running on port ${CONFIG.APP_PORT || 3000}....`);
    });
}).catch(err => {
    console.log("couldn't connect to the database", err);
});
export default app;