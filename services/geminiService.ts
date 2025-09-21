import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
let currentApiKey: string | null = null;

// Extend window interface to include our injected key
declare global {
    interface Window {
        injectedApiKey?: string;
    }
}

// --- Initialization Priority ---
let keyFromEnv = '';
// 1. Check for a key injected by a build process (e.g., via GitHub Actions).
//    It must not be the placeholder value.
if (typeof window.injectedApiKey === 'string' && window.injectedApiKey !== '' && window.injectedApiKey !== '__API_KEY__') {
    keyFromEnv = window.injectedApiKey;
} 
// 2. Fallback for standard build tools that replace process.env.
else if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    keyFromEnv = process.env.API_KEY;
}

// 3. If a key was found, try to initialize the AI client.
if (keyFromEnv && keyFromEnv.trim() !== '') {
    currentApiKey = keyFromEnv;
    try {
        ai = new GoogleGenAI({ apiKey: currentApiKey });
    } catch (e) {
        console.error("Failed to initialize with injected/ENV API key:", e);
        ai = null; // Clear client on failure
        currentApiKey = null;
    }
}

export const MISSING_API_KEY_ERROR = "Kunci API Google Gemini diperlukan. Harap berikan kunci API untuk melanjutkan.";
export const INVALID_API_KEY_ERROR = "Kunci API yang Anda berikan tidak valid. Silakan periksa kunci Anda dan coba lagi.";

/**
 * Sets the API key for the Gemini service.
 * @param key The Google Gemini API key.
 * @returns true if the key is valid and the client is initialized, false otherwise.
 */
export function setApiKey(key: string): boolean {
    if (key && key.trim() !== '') {
        try {
            // Test the key by creating a new client instance.
            const testAi = new GoogleGenAI({ apiKey: key });
            ai = testAi; // If it doesn't throw, assign it as the active client.
            currentApiKey = key;
            return true;
        } catch (error) {
            console.error("Failed to initialize GoogleGenAI with provided key:", error);
            ai = null;
            currentApiKey = null;
            return false;
        }
    }
    return false;
}

export async function processImageWithAI(base64Image: string, mimeType: string, prompt: string): Promise<string> {
    if (!ai) {
        // If ENV key was not present or failed, this will be null.
        // App should transition to asking for the key.
        throw new Error(MISSING_API_KEY_ERROR);
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

        // Check if the error is likely due to an invalid API key
        if (error instanceof Error && (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('permission denied'))) {
            // The key is bad. Reset the client so the app asks for a new one.
            ai = null;
            currentApiKey = null;
            throw new Error(INVALID_API_KEY_ERROR);
        }

        // For other errors, throw a generic message.
        throw new Error("Gagal berkomunikasi dengan layanan AI. Silakan coba lagi nanti.");
    }
}