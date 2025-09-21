
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, Task, ProcessedResult } from './types.ts';
import ImageUploader from './components/ImageUploader.tsx';
import ResultView from './components/ResultView.tsx';
import Loader from './components/Loader.tsx';
import TaskSelector from './components/TaskSelector.tsx';
import ApiKeyInput from './components/ApiKeyInput.tsx';
import { processImageWithAI, setApiKey, MISSING_API_KEY_ERROR, INVALID_API_KEY_ERROR } from './services/geminiService.ts';
import { fileToBase64 } from './utils/fileUtils.ts';
import { LogoIcon } from './components/Icons.tsx';

const AdComponent: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const adContainer = adRef.current;
    if (adContainer && adContainer.children.length === 0) {
      const container = document.createElement('div');
      container.id = 'container-10f9d35bcba536c63afb32dc4a986c0d';

      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = '//niecesprivilegelimelight.com/10f9d35bcba536c63afb32dc4a986c0d/invoke.js';
      script.onerror = () => {
        if(adContainer) {
            adContainer.innerHTML = '<div class="text-center text-slate-500 text-sm p-4">Ad could not be loaded. Please disable your ad-blocker.</div>';
        }
      };
      
      adContainer.appendChild(container);
      adContainer.appendChild(script);
    }
  }, []);

  return (
    <div className="my-6 w-full max-w-5xl mx-auto flex justify-center items-center" ref={adRef} style={{minHeight: '90px'}}>
      {/* Advertisement loads here */}
    </div>
  );
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const pendingTask = useRef<{ task: Task; language?: string } | null>(null);

  const executeTask = useCallback(async (task: Task, language?: string) => {
    if (imageFiles.length === 0) return;

    setCurrentTask(task);
    setAppState(AppState.PROCESSING);
    setError(null);
    setApiKeyError(null);

    let prompt = '';
    switch (task) {
      case Task.EXTRACT_TEXT:
        prompt = "Extract all visible text from this image. Ensure to maintain formatting and line breaks as much as possible. If no text is present, return an empty string.";
        break;
      case Task.DESCRIBE_IMAGE:
        prompt = "Describe this image in detail. What are the main subjects, what is the setting, and what is the overall mood?";
        break;
      case Task.TRANSLATE:
        const languageName = language ? new Intl.DisplayNames(['en'], { type: 'language' }).of(language) : 'the selected language';
        prompt = `First, extract all text from this image. Then, translate the extracted text into ${languageName}. Only return the translated text.`;
        break;
    }

    try {
      const processingPromises = imageFiles.map(async (file) => {
        const { base64, mimeType } = await fileToBase64(file);
        const text = await processImageWithAI(base64, mimeType, prompt);
        return text;
      });
      
      const processedTexts = await Promise.all(processingPromises);

      const newResults: ProcessedResult[] = imageUrls.map((url, index) => ({
        id: url,
        imageUrl: url,
        text: processedTexts[index] || '',
      }));

      setResults(newResults);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      
      if (errorMessage === MISSING_API_KEY_ERROR || errorMessage === INVALID_API_KEY_ERROR) {
          setError(null);
          setApiKeyError(errorMessage);
          setAppState(AppState.API_KEY_NEEDED);
      } else {
          setError(errorMessage);
          setAppState(AppState.ERROR);
      }
    }
  }, [imageFiles, imageUrls]);


  const handleTaskSelect = useCallback(async (task: Task, language?: string) => {
    pendingTask.current = { task, language };
    await executeTask(task, language);
  }, [executeTask]);


  const handleApiKeySubmit = useCallback(async (key: string) => {
    if (setApiKey(key)) {
      setApiKeyError(null);
      if (pendingTask.current) {
        await executeTask(pendingTask.current.task, pendingTask.current.language);
      } else {
        setAppState(AppState.IDLE);
      }
    } else {
      setApiKeyError(INVALID_API_KEY_ERROR);
      setAppState(AppState.API_KEY_NEEDED);
    }
  }, [executeTask]);

  const handleApiKeyCancel = () => {
    setApiKeyError(null);
    handleReset();
  };

  const handleImageSelect = useCallback((files: File[]) => {
    const urls = files.map(file => URL.createObjectURL(file));
    setImageFiles(files);
    setImageUrls(urls);
    setAppState(AppState.TASK_SELECTION);
  }, []);

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImageFiles([]);
    setResults([]);
    setError(null);
    setApiKeyError(null);
    setCurrentTask(null);
    pendingTask.current = null;
    if(imageUrls.length > 0) {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
      setImageUrls([]);
    }
  };
  
  const handleResultTextChange = (id: string, newText: string) => {
      setResults(prevResults => 
          prevResults.map(result => 
              result.id === id ? { ...result, text: newText } : result
          )
      );
  };

  const getResultTitle = () => {
      if (!currentTask) return "Result";
      switch(currentTask) {
          case Task.EXTRACT_TEXT:
              return "Extracted Text (Editable)";
          case Task.DESCRIBE_IMAGE:
              return "Image Description (Editable)";
          case Task.TRANSLATE:
              return "Translated Text (Editable)";
          default:
              return "Result (Editable)";
      }
  }

  const renderContent = () => {
    switch (appState) {
      case AppState.API_KEY_NEEDED:
        return <ApiKeyInput onSubmit={handleApiKeySubmit} onCancel={handleApiKeyCancel} initialError={apiKeyError} />;
      case AppState.TASK_SELECTION:
        return (
            imageUrls.length > 0 && <TaskSelector imageUrls={imageUrls} onSelectTask={handleTaskSelect} onCancel={handleReset} />
        );
      case AppState.PROCESSING:
        return (
          <div className="text-center bg-white/40 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-fuchsia-600">
                {currentTask ? `Processing ${imageFiles.length} image(s): ${currentTask}...` : 'Analyzing...'}
            </h2>
            <div className="flex flex-wrap justify-center gap-4 max-h-64 overflow-y-auto p-2 bg-black/5 rounded-lg">
                {imageUrls.map(url => <img key={url} src={url} alt="Preview" className="h-24 rounded-lg shadow-md" />)}
            </div>
            <Loader />
            <p className="text-slate-600 mt-4 animate-pulse">Artificial intelligence is working on your request.</p>
          </div>
        );
      case AppState.SUCCESS:
        return (
          <ResultView
            results={results}
            onTextChange={handleResultTextChange}
            onReset={handleReset}
            title={getResultTitle()}
          />
        );
      case AppState.ERROR:
        return (
          <div className="text-center bg-red-500/10 backdrop-blur-sm border border-red-500/50 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Processing Failed</h2>
            <p className="text-slate-700 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gradient-to-r from-sky-500 to-fuchsia-500 hover:opacity-90 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-md"
            >
              Try Again
            </button>
          </div>
        );
      case AppState.IDLE:
      default:
        return (
            <ImageUploader onImageSelect={handleImageSelect} />
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-5xl mx-auto text-center mb-8">
        <div className="flex justify-center items-center gap-x-3 sm:gap-x-4">
          <LogoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-sky-500" />
          <h1 className="text-4xl sm:text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-purple-600 to-sky-500 font-orbitron">
            Image to Doc
          </h1>
        </div>
        <p className="text-slate-600 mt-3 text-lg font-semibold">
          Instantly convert your images to editable documents. Extract, describe, and translate text with AI.
        </p>
      </header>
      
      <AdComponent />

      {appState === AppState.IDLE && (
        <section className="w-full max-w-5xl mx-auto mb-10 px-4">
          <div className="bg-white/40 backdrop-blur-lg border border-white/20 rounded-2xl p-6 sm:p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-sky-700 mb-4">Your Image-to-Document Companion</h2>
            <p className="text-slate-700 mb-6">
              Unlock the full potential of your images. This application uses advanced AI to perform multiple tasks: extract text for easy editing, generate rich descriptions of scenes, and even translate text found in images to other languages.
            </p>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <h3 className="text-xl font-semibold text-sky-600 mb-2">Key Features</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li><strong>Extract Text:</strong> High-accuracy text extraction.</li>
                  <li><strong>Describe Image:</strong> Get a detailed description of your image.</li>
                  <li><strong>Translate Text:</strong> Translate text within images to multiple languages.</li>
                  <li><strong>Edit & Export:</strong> Edit results and download as TXT, DOC, or PDF.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-sky-600 mb-2">How to Use</h3>
                <ol className="list-decimal list-inside text-slate-600 space-y-1">
                  <li><strong>Upload Image(s):</strong> Select one or more image files to get started.</li>
                  <li><strong>Choose a Task:</strong> Pick from extracting text, describing, or translating.</li>
                  <li><strong>Review & Edit:</strong> The AI-generated results will appear. Make any edits you need.</li>
                  <li><strong>Download:</strong> Save your work in your desired format.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      )}

      <main className="w-full max-w-5xl mx-auto flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
      <footer className="w-full text-center p-4 mt-8 text-slate-500">
        Powered by Generative AI
      </footer>
    </div>
  );
};

export default App;