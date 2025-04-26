"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoopIcon from "@mui/icons-material/Loop";
import { Button } from "./ui/Button";

export function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    // In a real app, you would upload the file to your server here
    // For this MVP, we'll simulate the recognition process

    // Simulate API call delay
    setTimeout(() => {
      // For demo purposes, we'll just redirect to the artwork page
      // In a real implementation, you would send the image to your backend
      // and get the artwork ID from the response
      router.push("/artwork?id=123");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-4">
        {preview ? (
          <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg border border-gray-200">
            <img
              src={preview || "/placeholder.svg"}
              alt="Artwork preview"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2 bg-white"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              Change
            </Button>
          </div>
        ) : (
          <label className="flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-6 text-center hover:bg-gray-50">
            <CloudUploadIcon className="h-10 w-10 text-gray-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium">upload artwork photo</p>
              <p className="text-xs text-gray-500">
                JPG, PNG or WEBP (max. 10MB)
              </p>
            </div>
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </label>
        )}

        <Button
          type="submit"
          className="w-full max-w-xs"
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <LoopIcon className="mr-2 h-4 w-4 animate-spin" />
              Recognizing artwork...
            </>
          ) : (
            "Recognize Artwork"
          )}
        </Button>
      </div>
    </form>
  );
}
