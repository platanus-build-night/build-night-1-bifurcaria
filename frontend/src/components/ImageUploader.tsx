"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoopIcon from "@mui/icons-material/Loop";
import { Button } from "./ui/Button";
import Image from "next/image";

// Define a type for the API response
interface ArtworkApiResponse {
  artworkId?: string;
  title?: string;
  artist?: string;
  description?: string;
  [key: string]: unknown;
}

export function Upload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // This status is used to track API call status internally
  // but not displayed in the UI for MVP simplicity
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // We need this state variable even if it's not directly used in the JSX
  // as it's used in the API call function
  const [imageBase64, setImageBase64] = useState<string | null>(null);

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

  const identifyArtwork = useCallback(async () => {
    // Check if URL is configured
    if (!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
      setErrorMsg("Error: n8n Webhook URL not configured in frontend code.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMsg(null);

    try {
      console.log(
        "Sending request to:",
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      ); // Log the URL

      // Extract the base64 data by removing the data URL prefix
      const base64Data = imageBase64?.split(",")[1] || "";

      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
        method: "POST", // Must match n8n Webhook setting
        headers: {
          "Content-Type": "application/json", // Tell n8n we're sending JSON
        },
        // Send only the base64 data without the prefix
        body: JSON.stringify({ imageData: base64Data }),
      });

      console.log("Received response status:", response.status); // Log status

      // Clone the response to read the text content for debugging
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        let errorText = `API Error: ${response.status}`;
        try {
          // Try to get more details if n8n sends a JSON error
          const errorJson = await response.json();
          errorText += ` - ${errorJson.message || JSON.stringify(errorJson)}`;
        } catch {
          // If response is not JSON, use status text
          errorText += ` - ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      // Check if response is empty
      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response received from server");
      }

      try {
        // Parse the JSON response from n8n
        const result = JSON.parse(responseText) as ArtworkApiResponse;
        console.log("API Result Received:", result);

        setStatus("success");

        // Redirect to artwork page with the ID from the API response
        if (result && result.artworkId) {
          router.push(`/artwork?id=${result.artworkId}`);
        } else {
          // If no ID is returned, use the mock one for now
          router.push("/artwork?id=123");
        }
      } catch (jsonError: unknown) {
        console.error("JSON parsing error:", jsonError);
        throw new Error(
          `Invalid JSON response: ${
            jsonError instanceof Error ? jsonError.message : String(jsonError)
          }`
        );
      }
    } catch (error) {
      console.error("API Call Error:", error);
      setStatus("error");
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "An unknown API error occurred."
      );
    }
  }, [imageBase64, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !imageBase64) return;

    setLoading(true);
    await identifyArtwork();
    setLoading(false);
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
