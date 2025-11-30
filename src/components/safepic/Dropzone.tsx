'use client';

import { useState, DragEvent, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function Dropzone({ onFileSelect, disabled = false }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('画像ファイルを選択してください');
      }
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      } else {
        alert('画像ファイルを選択してください');
      }
    }
  };

  return (
    <Card
      className={`relative cursor-pointer transition-all ${
        isDragging
          ? 'border-primary bg-primary/5 border-2'
          : 'border-dashed border-2 hover:border-primary/50 hover:bg-accent/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label
        className={`flex flex-col items-center justify-center gap-4 p-12 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div
          className={`rounded-full p-4 ${
            isDragging ? 'bg-primary/10' : 'bg-accent'
          }`}
        >
          {isDragging ? (
            <ImageIcon className="h-12 w-12 text-primary" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground" />
          )}
        </div>

        <div className="text-center" style={{ writingMode: 'horizontal-tb' }}>
          <p className="text-lg font-semibold" style={{ writingMode: 'horizontal-tb' }}>
            {isDragging ? '画像をドロップ' : '画像をドラッグ＆ドロップ'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground" style={{ writingMode: 'horizontal-tb' }}>
            または、クリックしてファイルを選択
          </p>
          <p className="mt-2 text-xs text-muted-foreground" style={{ writingMode: 'horizontal-tb' }}>
            対応形式: JPEG, PNG, GIF, WebP
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />
      </label>
    </Card>
  );
}

