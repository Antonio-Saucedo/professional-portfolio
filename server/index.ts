import express, {Request, Response} from 'express';
import cors from 'cors';
import {GoogleGenAI} from '@google/genai';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: [
        'https://antoniosoftwareengineer.com',
        'https://www.antoniosoftwareengineer.com',
        'http://localhost:5173',
    ],
    methods: ['POST', 'GET'],
}));

app.use(express.json());

interface CoverLetterRequestBody {
    job_description: string;
    name_and_role: string;
    key_experience: string;
    tone: string;
}

// Ping endpoint — called when the modal opens to wake the server from cold start
app.get('/ping', (_req: Request, res: Response) => {
    res.json({status: 'ok'});
});

// Cover letter generation endpoint
app.post('/generate-cover-letter', async (req: Request<{}, {}, CoverLetterRequestBody>, res: Response) => {
    const {job_description, name_and_role, key_experience, tone} = req.body;

    if (!job_description || !name_and_role) {
        res.status(400).json({error: 'Missing required fields'});
        return;
    }

    try {
        const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents:
                `You are a cover letter writing assistant. Your only function is to generate professional cover letters. ` +
                `You must not answer questions, provide advice, or perform any task other than writing a cover letter. ` +
                `If the information provided is insufficient, generate the best cover letter possible with what is given. ` +
                `Do not include any preamble, explanation, or closing remarks — output only the cover letter text itself.\n\n` +
                `Generate a cover letter using the following:\n` +
                `Job description: ${job_description}\n` +
                `Candidate name and role: ${name_and_role}\n` +
                `Key experience: ${key_experience}\n` +
                `Tone: ${tone}`,
        });

        res.json({result: response.text ?? ''});
    } catch (err) {
        console.error('Gemini API error:', err);
        res.status(500).json({error: 'Failed to generate cover letter'});
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
