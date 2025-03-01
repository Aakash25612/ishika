
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Image, Upload } from 'lucide-react';

interface DragDropProps {
  onImageSelect: (file: File) => void;
  variant?: 'standard' | 'network';
}

const DragDrop = ({ onImageSelect, variant = 'standard' }: DragDropProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed p-12 transition-colors
        ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
      `}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
    >
      <input {...getInputProps()} />
      <motion.div
        className="flex flex-col items-center justify-center gap-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-full bg-primary/10 p-4">
          {variant === 'network' ? (
            <Image className="h-6 w-6 text-primary" />
          ) : (
            <Upload className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="max-w-xs">
          {variant === 'network' ? (
            <>
              <p className="mb-2 text-sm font-medium">Drop BitPic network message</p>
              <p className="text-xs text-muted-foreground">
                Import trading proposals or network messages from Telegram, Facebook, or other channels
              </p>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium">Drag and drop your image here</p>
              <p className="text-xs text-muted-foreground">
                or click to select a file from your computer
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DragDrop;
