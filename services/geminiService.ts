
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
let userApiKey: string | null = null;

export const MISSING_API_KEY_ERROR = "Layanan AI tidak diinisialisasi. Pastikan kunci API Anda dikonfigurasi dengan benar atau berikan satu di aplikasi.";
export const INVALID_API_KEY_ERROR = "Kunci API yang Anda berikan tidak valid atau tidak memiliki izin yang benar. Silakan periksa kunci Anda.";

function initializeAIClient(): boolean {
  // Prioritas: 1. Klien yang sudah diinisialisasi, 2. Kunci yang disediakan pengguna, 3. Variabel lingkungan
  if (ai) {
    return true;
  }
  
  const key = userApiKey || (typeof process !== 'undefined' && process.env ? process.env.API_KEY : '');

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

export function setUserApiKey(apiKey: string) {
  userApiKey = apiKey;
  ai = null; // Paksa inisialisasi ulang pada panggilan berikutnya
}

export async function processImageWithAI(base64Image: string, mimeType: string, prompt: string): Promise<string> {
  if (!initializeAIClient()) {
    throw new Error(MISSING_API_KEY_ERROR);
  }

  // Variabel 'ai' dijamin non-null di sini jika initializeAIClient mengembalikan true.
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
