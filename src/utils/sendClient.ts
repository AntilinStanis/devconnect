import { SESClient } from "@aws-sdk/client-ses";
import CONFIG from "../../config/config.js";

/**
 * SES service object.
 * Configured with credentials and region from the central CONFIG file.
 */
export const sesClient = new SESClient({
    region: CONFIG.AWS_REGION!,
    credentials: {
        accessKeyId: CONFIG.AWS_SES_ACCESS_KEY!,
        secretAccessKey: CONFIG.AWS_SES_SECRET_KEY!
    }
});