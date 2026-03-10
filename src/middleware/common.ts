import nodemailer from "nodemailer";
import type { Transporter, SendMailOptions } from "nodemailer";
import CONFIG from "../../config/config.js";

interface ITransporterData {
    mailHost: string;
    mailPort: number;
    auth: {
        userMail: string;
        password: string;
    };
};

const createTransporter = async (transporterData?: ITransporterData): Promise<Transporter> => {
    try {
        const transporter = nodemailer.createTransport({
            host: transporterData?.mailHost || CONFIG.MAIL_HOST!,
            port: Number(transporterData?.mailPort || CONFIG.MAIL_PORT!),
            secure: true,
            auth: {
                user: transporterData?.auth.userMail || CONFIG.USER_MAIL!,
                pass: transporterData?.auth.password || CONFIG.USER_PASSWORD!,
            },
            tls: {
                rejectUnauthorized: false,
            }
        });

        await transporter.verify();
        
        return transporter;
    } catch (err: any) {
        throw new Error(`Transporter Creation Failed: ${err.message}`);
    };
};

const sendMail = async (transporter: Transporter, mailOptions: SendMailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);

        if (!info.messageId) {
            throw new Error("Error sending email: No Message ID returned");
        }

        return { msg: "mail sent successfully!", messageId: info.messageId };
    } catch (err: any) {
        throw new Error(`Mail Send Failed: ${err.message}`);
    }
};

export { createTransporter, sendMail };