import React, { useState } from 'react';
import { Task } from '../types';
import { TxtIcon, DescriptionIcon, TranslateIcon } from './Icons';

interface TaskSelectorProps {
    imageUrls: string[];
    onSelectTask: (task: Task, language?: string) => void;
    onCancel: () => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
];

const triggerAd = () => {
  window.open('https://niecesprivilegelimelight.com/x1vnqmu9?key=7abbf635479d3bf5a80581864c104b74', '_blank');
};

const TaskSelector: React.FC<TaskSelectorProps> = ({ imageUrls, onSelectTask, onCancel }) => {
    const [language, setLanguage] = useState(LANGUAGES[0].code);

    return (
        <div className="w-full max-w-4xl text-center bg-white/40 backdrop-blur-lg border border-white/20 p-6 sm:p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-700 mb-4">Choose a Task</h2>
            <p className="text-slate-600 mb-6">What would you like to do with these {imageUrls.length} image(s)?</p>

            <div className="mb-8 p-4 bg-black/5 rounded-lg overflow-hidden">
                <div className="flex overflow-x-auto space-x-4">
                    {imageUrls.map((url, index) => (
                        <img key={url} src={url} alt={`Selected for processing ${index + 1}`} className="flex-shrink-0 h-48 rounded-md object-contain" />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Task Buttons */}
                <button onClick={() => { triggerAd(); onSelectTask(Task.EXTRACT_TEXT); }} className="task-button">
                    <TxtIcon className="w-8 h-8 mb-2" />
                    <span>{Task.EXTRACT_TEXT}</span>
                </button>
                <button onClick={() => { triggerAd(); onSelectTask(Task.DESCRIBE_IMAGE); }} className="task-button">
                    <DescriptionIcon className="w-8 h-8 mb-2" />
                    <span>{Task.DESCRIBE_IMAGE}</span>
                </button>
                
                {/* Translation Task */}
                <div className="md:col-span-2 p-4 bg-white/30 backdrop-blur-sm border border-white/20 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-4">
                    <TranslateIcon className="w-8 h-8 text-sky-600" />
                    <span className="font-semibold text-slate-700">{Task.TRANSLATE} to:</span>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white/70 border border-slate-400/50 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        aria-label="Select language for translation"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                    <button onClick={() => { triggerAd(); onSelectTask(Task.TRANSLATE, language); }} className="px-5 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 hover:opacity-90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md">
                        Translate
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <button onClick={onCancel} className="text-slate-500 hover:text-fuchsia-600 transition-colors font-medium">
                    Choose different image(s)
                </button>
            </div>
            <style>{`
                .task-button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    background-color: rgba(255, 255, 255, 0.5);
                    border-radius: 0.75rem;
                    transition: all 0.2s ease-in-out;
                    font-weight: 600;
                    color: #334155; /* slate-700 */
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                }
                .task-button:hover {
                    color: #ffffff;
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    background-image: linear-gradient(to right, var(--tw-gradient-stops));
                    --tw-gradient-from: #0ea5e9; /* sky-500 */
                    --tw-gradient-to: #d946ef;   /* fuchsia-500 */
                    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
                }
            `}</style>
        </div>
    );
}

export default TaskSelector;
