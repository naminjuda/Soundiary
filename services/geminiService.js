import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

export async function getEmotionKeywords(diaryText) {
    if (!diaryText || typeof diaryText !== 'string') {
        throw new Error('Invalid diaryText provided.');
    }

    const prompt = `
    Extract the main emotional keywords from the following diary entry. 
    Provide the keywords as a comma-separated list.

    Diary Entry:
    "${diaryText}"
    `;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: prompt }] }
            ],
            config: {
                systemInstruction: 'You are an expert in emotional analysis.',
                maxOutputTokens: 100,
            },
        });

        const response = result.response;
        const text = response.text();
        if (!text || text !== 'string') {
            console.error('Invalid text response from Gemini API:', response);
            throw new Error('Invalid response from Gemini API.');
        }

        const keywords = text.trim();
        return keywords;
    } catch (error) {
        console.error('Error fetching emotion keywords:', error);
        throw new Error('Failed to get emotion keywords.');
    }
}