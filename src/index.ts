import express, { type Application, type Request, type Response } from 'express';

const app: Application = express();

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Middleware to parse JSON (needed for your Parking Lot API)
app.use(express.json());

// A simple test route
app.get('/', (req: Request, res: Response) => {
    res.send('Dev Connect is Live! 🚀');
});

export default app;