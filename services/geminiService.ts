import { GoogleGenAI } from "@google/genai";

const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export async function processImageWithAI(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  if (!ai) {
    throw new Error("AI Service is not initialized. Check API Key configuration.");
  }
  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Image,
      },
    };

    const textPart = {
      text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling AI service:", error);
    throw new Error("Failed to communicate with the AI service. Please try again later.");
  }
}
