import dotenv from 'dotenv';

dotenv.config();

interface AppConfig {
    APP_PORT: string | undefined;
    DATABASE_URL: string | undefined;
    JWT_SECRET_KEY: string | undefined;
    JWT_EXPIRATION: string | undefined;
    COOKIE_EXPIRATION: string | undefined;
    JWT_FORGOT_PASSWORD_KEY: string | undefined;
    JWT_FORGOT_PASSWORD_EXPIRATION: string | undefined;
    USER_MAIL: string | undefined;
    USER_PASSWORD: string | undefined;
    MAIL_HOST: string | undefined;
    MAIL_PORT: string | undefined;
    AWS_SES_ACCESS_KEY: string | undefined;
    AWS_SES_SECRET_KEY: string | undefined;
    AWS_REGION: string | undefined;
    RAZORPAY_KEYID: string | undefined;
    RAZORPAY_SECRETKEY: string | undefined;
    RAZORPAY_WEBHOOK_SECRET: string | undefined;
};

const CONFIG: AppConfig = {
    APP_PORT: process.env.APP_PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION,
    COOKIE_EXPIRATION: process.env.COOKIE_EXPIRATION,
    JWT_FORGOT_PASSWORD_KEY: process.env.JWT_FORGOT_PASSWORD_KEY,
    JWT_FORGOT_PASSWORD_EXPIRATION: process.env.JWT_FORGOT_PASSWORD_EXPIRATION,
    USER_MAIL: process.env.USER_MAIL,
    USER_PASSWORD: process.env.USER_PASSWORD,
    MAIL_HOST: process.env.MAIL_HOST,
    MAIL_PORT: process.env.MAIL_PORT,
    AWS_SES_ACCESS_KEY: process.env.AWS_SES_ACCESS_KEY,
    AWS_SES_SECRET_KEY: process.env.AWS_SES_SECRET_KEY,
    AWS_REGION: process.env.AWS_REGION,
    RAZORPAY_KEYID: process.env.RAZORPAY_KEYID,
    RAZORPAY_SECRETKEY: process.env.RAZORPAY_SECRETKEY,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
};

export default CONFIG;