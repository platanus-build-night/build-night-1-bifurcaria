"use client";

import type React from "react";

import { useState } from "react";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoopIcon from "@mui/icons-material/Loop";
import { Button } from "./ui/Button";
import Image from "next/image";
import { useArtworkIdentifier } from "@/hooks/useArtworkIdentifier";

export function Upload() {
  const {
    identifyArtwork,
    loading,
    errorMsg: hookErrorMsg,
  } = useArtworkIdentifier();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      setImageBase64(result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !imageBase64) return;

    setErrorMsg(null);
    await identifyArtwork(imageBase64);

    // Update error from hook if needed
    if (hookErrorMsg) {
      setErrorMsg(hookErrorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-4">
        {preview ? (
          <div className="relative aspect-square w-full max-w-xs overflow-hidden rounded-lg border border-gray-200">
            <Image
              src={preview || "/placeholder.svg"}
              alt="Artwork preview"
              className="h-full w-full object-cover"
              width={600}
              height={800}
              unoptimized
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2 bg-white"
              onClick={() => {
                setFile(null);
                setPreview(null);
                setImageBase64(null);
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

        {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}

        <Button
          type="submit"
          className="w-full max-w-xs"
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <LoopIcon className="mr-2 h-4 w-4 animate-spin" />
              recognizing artwork...
            </>
          ) : (
            "recognize artwork"
          )}
        </Button>
      </div>
    </form>
  );
}
