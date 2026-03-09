import express, { type Application } from 'express';
import { connection } from "./model/index.js";
import CONFIG from "../config/config.js";
import cookieParser from "cookie-parser";
import http from "http";

const server = http.createServer();
const app: Application = express();

import authRoutes from "./routes/auth.js";

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes.router);

connection().then(() => {
    console.log("successfully connected to the database...");
    server.listen(CONFIG.APP_PORT || 3000, () => {
        console.log(`server running on port ${CONFIG.APP_PORT || 3000}....`);
    });
}).catch(err => {
    console.log("couldn't connect to the database", err);
});
export default app;