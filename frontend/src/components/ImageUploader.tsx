// frontend/src/components/ImageUploader.tsx
"use client"; // Required for components with event listeners/state in Next.js App Router

import React, { useState, useCallback } from "react";

interface ImageUploaderProps {
  // Callback function to pass the Base64 data URL back to the parent
  onImageRead: (base64Data: string) => void;
  // Optional callback for errors
  onError?: (errorMessage: string) => void;
}

export default function ImageUploader({
  onImageRead,
  onError,
}: ImageUploaderProps) {
  const [status, setStatus] = useState<"idle" | "reading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) {
        setStatus("idle");
        setErrorMsg(null);
        return; // No file selected
      }

      const file = files[0];
      // Basic type check (browser might still allow others via 'All Files')
      if (!file.type.startsWith("image/")) {
        setStatus("error");
        const userMessage = "Please select an image file.";
        setErrorMsg(userMessage);
        onError?.(userMessage); // Notify parent if handler exists
        return;
      }

      setStatus("reading");
      setErrorMsg(null);

      const reader = new FileReader();

      reader.onloadend = () => {
        // This runs when reading is complete (success or error)
        if (reader.result && typeof reader.result === "string") {
          setStatus("idle"); // Ready for next upload
          setErrorMsg(null);
          onImageRead(reader.result); // Pass the Base64 data URL up
        } else {
          setStatus("error");
          const userMessage = "Failed to read the file.";
          setErrorMsg(userMessage);
          onError?.(userMessage);
        }
      };

      reader.onerror = () => {
        // Handle FileReader errors specifically
        setStatus("error");
        const userMessage = "Error reading the file.";
        setErrorMsg(userMessage);
        onError?.(userMessage);
      };

      // Start reading the file as a Base64 data URL
      reader.readAsDataURL(file);
    },
    [onImageRead, onError]
  ); // Dependencies for useCallback

  return (
    <div
      style={{
        border: "1px dashed #ccc",
        padding: "15px",
        marginBottom: "15px",
      }}
    >
      <label htmlFor="imageUploadInput">Select Artwork Image:</label>
      <input
        type="file"
        id="imageUploadInput"
        accept="image/*" // Hint to browser to filter for images
        onChange={handleFileChange}
        disabled={status === "reading"} // Disable while processing
        style={{ display: "block", marginTop: "5px" }}
      />
      {status === "reading" && <p style={{ color: "blue" }}>Reading file...</p>}
      {status === "error" && <p style={{ color: "red" }}>Error: {errorMsg}</p>}
      {/* Optional: Display thumbnail preview? Could add here */}
    </div>
  );
}
