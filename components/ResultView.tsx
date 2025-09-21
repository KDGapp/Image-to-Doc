import React from 'react';
import { downloadTxt, downloadDoc, downloadPdf } from '../utils/fileUtils';
import { TxtIcon, DocIcon, PdfIcon } from './Icons';
import { ProcessedResult } from '../types';

interface ResultItemProps {
  result: ProcessedResult;
  onTextChange: (text: string) => void;
}

const triggerAd = () => {
  window.open('https://niecesprivilegelimelight.com/x1vnqmu9?key=7abbf635479d3bf5a80581864c104b74', '_blank');
};

const ResultItem: React.FC<ResultItemProps> = ({ result, onTextChange }) => {
  return (
    <div className="bg-white/50 backdrop-blur-md border border-white/30 p-4 rounded-xl flex flex-col md:flex-row gap-4 shadow-md">
      <div className="md:w-1/3 flex-shrink-0">
        <img src={result.imageUrl} alt="Processed content" className="object-contain w-full h-full max-h-48 md:max-h-full rounded-lg bg-black/5" />
      </div>
      <div className="flex-grow flex flex-col">
        <textarea
          value={result.text}
          onChange={(e) => onTextChange(e.target.value)}
          className="w-full flex-grow bg-white/60 border-2 border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors placeholder:text-slate-500"
          placeholder="Result..."
        />
        <div className="mt-3 flex items-center gap-2">
            <span className="font-semibold text-sm text-slate-600">Download:</span>
            <button onClick={() => { triggerAd(); downloadTxt(result.text); }} className="download-button border-green-500 text-green-600 hover:bg-green-500 hover:text-white">
                <TxtIcon className="w-4 h-4" /> .TXT
            </button>
            <button onClick={() => { triggerAd(); downloadDoc(result.text); }} className="download-button border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white">
                <DocIcon className="w-4 h-4" /> .DOC
            </button>
            <button onClick={() => { triggerAd(); downloadPdf(result.text); }} className="download-button border-red-500 text-red-600 hover:bg-red-500 hover:text-white">
                <PdfIcon className="w-4 h-4" /> .PDF
            </button>
        </div>
      </div>
    </div>
  );
};


interface ResultViewProps {
  results: ProcessedResult[];
  onTextChange: (id: string, text: string) => void;
  onReset: () => void;
  title: string;
}

const ResultView: React.FC<ResultViewProps> = ({ results, onTextChange, onReset, title }) => {
  return (
    <div className="w-full h-full bg-white/40 backdrop-blur-lg border border-white/20 p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col">
      <div className="flex-shrink-0 mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-fuchsia-600">{title} ({results.length} item(s))</h3>
        <button onClick={onReset} className="px-6 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 hover:opacity-90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md">
            Start Over
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-4 pr-2">
        {results.map((result) => (
          <ResultItem 
            key={result.id}
            result={result}
            onTextChange={(newText) => onTextChange(result.id, newText)}
          />
        ))}
      </div>
       <style>{`
          .download-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.75rem;
            border-radius: 0.375rem;
            transition: all 0.2s ease-in-out;
            font-size: 0.875rem;
            font-weight: 500;
            transform-origin: center;
            border-width: 1px;
            background-color: transparent;
          }
          .download-button:hover {
            transform: scale(1.05);
          }
      `}</style>
    </div>
  );
};

export default ResultView;
