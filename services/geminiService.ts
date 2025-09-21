import { GoogleGenAI } from "@google/genai";

const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function processImageWithAI(base64Image: string, mimeType: string, prompt: string): Promise<string> {
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