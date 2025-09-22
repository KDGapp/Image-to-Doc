
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export const MISSING_API_KEY_ERROR = "Aplikasi tidak dikonfigurasi dengan benar. Kunci API tidak ditemukan.";
export const INVALID_API_KEY_ERROR = "Kunci API yang diberikan tidak valid. Silakan periksa konfigurasi aplikasi.";

function initializeAIClient(): boolean {
  if (ai) {
    return true;
  }
  
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
  
  return false;
}

export async function processImageWithAI(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  if (!initializeAIClient()) {
    throw new Error(MISSING_API_KEY_ERROR);
  }

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
        ai = null; // Atur ulang klien jika kunci API tidak valid
        throw new Error(INVALID_API_KEY_ERROR);
    }

    throw new Error("Gagal berkomunikasi dengan layanan AI. Silakan coba lagi nanti.");
  }
}
