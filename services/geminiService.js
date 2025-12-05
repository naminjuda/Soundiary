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

    IMPORTANT: If the text is unreadable or meaningless, JUST return "unknown".
    `; // 프롬프트 작성, 감정 키워드 추출 요청, 의미 없는 경우 "unknown" 반환 지시

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: prompt }] }
            ],
        });

        const text = response.text;
        if (!text || typeof text !== 'string') {
            console.error('Invalid text response from Gemini API:', text);
            throw new Error('Invalid response from Gemini API.');
        }

        const keywords = text.trim().split(',').map((keyword) => keyword.trim());
        return keywords;
    } catch (error) {
        console.error('Error fetching emotion keywords:', error);
        throw new Error('Failed to get emotion keywords.');
    }
}
