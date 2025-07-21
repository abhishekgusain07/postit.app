"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, FileImage, FileVideo } from "lucide-react";

interface Media {
  url: string;
  type: 'image' | 'video';
  altText?: string;
}

interface MediaUploaderProps {
  onFileUpload: (media: Media) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  existingMedia?: Media[];
}

export function MediaUploader({
  onFileUpload,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'video/*': ['.mp4', '.mov', '.avi']
  },
  maxSize = 25 * 1024 * 1024, // 25MB default
  maxFiles = 1,
  existingMedia = []
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = Object.keys(accept).join(',');

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0]; // Take first file only
    
    // Check file size
    if (file.size > maxSize) {
      alert(`File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      return;
    }

    // Check file type
    const isValidType = Object.entries(accept).some(([mimeType, extensions]) => {
      return file.type.includes(mimeType.replace('/*', '')) || 
             extensions.some(ext => file.name.toLowerCase().endsWith(ext.toLowerCase()));
    });

    if (!isValidType) {
      alert('Invalid file type');
      return;
    }

    setIsUploading(true);

    try {
      // Create object URL for preview
      const url = URL.createObjectURL(file);
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

      const media: Media = {
        url,
        type: mediaType,
        altText: file.name
      };

      onFileUpload(media);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="flex flex-col items-center space-y-2">
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium">
              {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500">
              {Object.values(accept).flat().join(', ')} up to {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
        </div>
      </div>

      {/* Preview existing media */}
      {existingMedia.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Media</Label>
          <div className="flex flex-wrap gap-2">
            {existingMedia.map((item, index) => (
              <div key={index} className="relative group">
                <div className="flex items-center space-x-2 p-2 border rounded-md">
                  {item.type === 'image' ? (
                    <FileImage className="h-4 w-4 text-blue-500" />
                  ) : (
                    <FileVideo className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-sm truncate max-w-32">
                    {item.altText || 'Media file'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}