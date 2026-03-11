import cron from 'node-cron';
import { subDays, startOfDay, endOfDay } from 'date-fns';
import ConnectionRequest from '../model/connectionRequest.js';
import { run } from './sendMail.js';

/**
 * Daily Cron Job: Runs at 8:00 AM every day
 * Purpose: Notifies users about connection requests received the previous day.
 */
cron.schedule('0 8 * * *', async () => {
    console.log("CRON: Starting daily pending request email notifications...");

    try {
        const yesterdayDate = subDays(new Date(), 1);
        const yesterdayStart = startOfDay(yesterdayDate);
        const yesterdayEnd = endOfDay(yesterdayDate);

        // 1. Fetch all 'interested' requests created yesterday
        const pendingRequests = await ConnectionRequest.find({
            status: 'interested',
            createdAt: {
                $gte: yesterdayStart,
                $lt: yesterdayEnd
            }
        }).populate('toUserId');

        // 2. Filter unique recipient emails using a Set
        // We cast to any because of the populate, or use an interface if available
        const uniqueRecipients = new Map<string, string>(); // Email -> FirstName

        pendingRequests.forEach((req: any) => {
            if (req.toUserId?.emailId) {
                uniqueRecipients.set(req.toUserId.emailId, req.toUserId.firstName);
            }
        });

        // 3. Send emails
        for (const [email, firstName] of uniqueRecipients.entries()) {
            try {
                await run({subject:`New Friend request pending for ${email}`,body:`You have send a connection request on ${yesterdayDate} to ${firstName}.Please log into devtinder for information on pending request.`});
                console.log(`CRON: Email sent successfully to ${email}`);
            } catch (mailError) {
                console.error(`CRON: Failed to send email to ${email}:`, mailError);
            }
        }

    } catch (error) {
        console.error("CRON ERROR:", error);
    }
});