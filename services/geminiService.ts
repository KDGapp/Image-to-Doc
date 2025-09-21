
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export const MISSING_API_KEY_ERROR = "Kunci API Google tidak ditemukan di lingkungan. Harap atur variabel lingkungan API_KEY agar aplikasi dapat berfungsi.";
export const INVALID_API_KEY_ERROR = "Kunci API yang disediakan di lingkungan Anda tidak valid atau telah kedaluwarsa. Silakan periksa konfigurasi API_KEY Anda.";

function initializeAIClient(): boolean {
  // If already initialized, no need to do it again.
  if (ai) {
    return true;
  }
  
  // Get API key exclusively from environment variables.
  const key = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';

  if (key && key.trim() !== '') {
    try {
      ai = new GoogleGenAI({ apiKey: key });
      return true;
    } catch (error) {
      console.error("Gagal menginisialisasi GoogleGenAI:", error);
      ai = null; 
      return false;
    }
  }
  
  // If no key, initialization fails.
  return false;
}

export async function processImageWithAI(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  if (!initializeAIClient()) {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  // 'ai' is guaranteed to be non-null here if initializeAIClient returns true.
  const client = ai!; 

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

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error saat memanggil layanan AI:", error);

    if (error instanceof Error && (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('permission denied'))) {
        ai = null; // Reset client if API key is invalid
        throw new Error(INVALID_API_KEY_ERROR);
    }

    throw new Error("Gagal berkomunikasi dengan layanan AI. Silakan coba lagi nanti.");
  }
}