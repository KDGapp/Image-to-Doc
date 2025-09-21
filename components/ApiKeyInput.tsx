
import React, { useState } from 'react';

interface ApiKeyInputProps {
    onSubmit: (apiKey: string) => void;
    onCancel: () => void;
    initialError?: string | null;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmit, onCancel, initialError }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState<string | null>(initialError || null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError("Kunci API tidak boleh kosong.");
            return;
        }
        setError(null);
        onSubmit(apiKey);
    };

    return (
        <div className="text-center bg-white/40 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-lg w-full max-w-md animate-fade-in">
            <h2 className="text-2xl font-semibold mb-4 text-sky-700">Diperlukan Kunci API</h2>
            <p className="text-slate-600 mb-6">
                Kunci API diperlukan untuk menggunakan fitur AI. Silakan masukkan kunci API Google Gemini Anda di bawah ini.
                Jika Anda tidak memilikinya, Anda bisa mendapatkannya dari Google AI Studio.
            </p>
            {error && (
                <div className="bg-red-500/20 text-red-700 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Masukkan Kunci API Gemini Anda"
                    className="w-full bg-white/60 border-2 border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors"
                    aria-label="Input Kunci API Gemini"
                />
                <div className="flex justify-center gap-4">
                     <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 hover:opacity-90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
                    >
                        Simpan & Lanjutkan
                    </button>
                </div>
            </form>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ApiKeyInput;
