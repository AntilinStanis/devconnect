import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./sendClient.js";

const createSendEmailCommand = (toAddress: string, fromAddress: string, requestMessage: any) => {
    return new SendEmailCommand({
        Destination: {
            CcAddresses: [
            ],
            ToAddresses: [
                toAddress,
            ],
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `${requestMessage?.body}`,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: "This is the text format email",
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: `${requestMessage?.subject}`,
            },
        },
        Source: fromAddress,
        ReplyToAddresses: [
        ],
    });
};

const run = async (message: any) => {
    const sendEmailCommand = createSendEmailCommand(
        "anithaasha12@gmail.com",
        "admin@ashainfo.xyz",
        message
    );

    try {
        return await sesClient.send(sendEmailCommand);
    } catch (caught) {
        if (caught instanceof Error && caught.name === "MessageRejected") {
            const messageRejectedError = caught;
            return messageRejectedError;
        }
        throw caught;
    };
};

export { run };