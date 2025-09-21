
import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './Icons.tsx';

interface ImageUploaderProps {
  onImageSelect: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onImageSelect(Array.from(files));
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            onImageSelect(imageFiles);
        }
    }
  }, [onImageSelect]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };


  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`group w-full max-w-2xl p-8 sm:p-12 border-4 border-dashed rounded-2xl cursor-pointer transition-all duration-300 bg-white/40 backdrop-blur-lg shadow-lg
      ${isDragging 
          ? 'border-fuchsia-500 bg-fuchsia-500/10 scale-105 shadow-2xl shadow-fuchsia-500/20' 
          : 'border-slate-400/50 hover:border-fuchsia-400 hover:bg-white/60'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        multiple
      />
      <div className="flex flex-col items-center justify-center text-center">
        <UploadIcon className="w-16 h-16 text-slate-500 mb-4 transition-transform duration-300 group-hover:text-fuchsia-500 group-hover:scale-110" />
        <p className="text-xl font-semibold text-slate-700">
          Drag & Drop or Click to Upload
        </p>
        <p className="text-slate-500 mt-2">
          Choose one or more image files (PNG, JPG, WEBP).
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;