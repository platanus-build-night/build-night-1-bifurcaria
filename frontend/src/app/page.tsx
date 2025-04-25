// frontend/src/app/page.tsx
"use client"; // Required for useState, useEffect, event handlers

import React, { useState, useCallback } from "react";
import ImageUploader from "@/components/ImageUploader"; // Adjust import path if needed

export default function HomePage() {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [apiResult, setApiResult] = useState<any>(null); // To store n8n response
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Callback for the ImageUploader component
  const handleImageReady = useCallback((base64Data: string) => {
    console.log(
      "Image read successfully (first ~50 chars):",
      base64Data.substring(0, 50)
    );
    setImageBase64(base64Data);
    setStatus("idle"); // Ready to trigger API call
    setErrorMsg(null); // Clear previous errors
    setApiResult(null); // Clear previous results
  }, []);

  // Callback for errors from ImageUploader
  const handleImageError = useCallback((message: string) => {
    setErrorMsg(`Image Upload Error: ${message}`);
    setStatus("error");
    setImageBase64(null); // Clear any previously stored image data
  }, []);

  // Function to call your n8n workflow
  const identifyArtwork = useCallback(async () => {
    if (!imageBase64) {
      setErrorMsg("Please select an image first.");
      setStatus("error");
      return;
    }

    // IMPORTANT: Replace with YOUR actual n8n webhook URL
    const N8N_WEBHOOK_URL = "YOUR_N8N_PRODUCTION_WEBHOOK_URL_HERE";
    if (N8N_WEBHOOK_URL === "YOUR_N8N_PRODUCTION_WEBHOOK_URL_HERE") {
      setErrorMsg("Error: n8n Webhook URL not configured in frontend code.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setErrorMsg(null);
    setApiResult(null);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData: imageBase64 }), // Send the Base64 data
      });

      if (!response.ok) {
        // Try to get error details from n8n response if possible
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore if response wasn't json
        }
        console.error("API Error Response:", errorData);
        throw new Error(
          `API request failed with status ${response.status}. ${
            errorData?.message || ""
          }`
        );
      }

      const result = await response.json();
      console.log("API Result:", result);
      setApiResult(result);
      setStatus("success");
    } catch (error) {
      console.error("API Call Error:", error);
      setStatus("error");
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "An unknown API error occurred."
      );
      setApiResult(null);
    }
  }, [imageBase64]); // Dependency: trigger requires imageBase64

  // --- Favorites Logic (Placeholder Functions - Implement as needed) ---
  const saveToFavorites = (data: any) => {
    console.log("Save to Favorites clicked:", data);
    // Implement localStorage logic here
    alert("Save to Favorites - Not fully implemented yet.");
  };

  const displayFavorites = () => {
    console.log("Display Favorites clicked");
    alert("Display Favorites - Not fully implemented yet.");
    // Implement localStorage logic here to show favorites
    return <p>Favorites would appear here.</p>; // Placeholder
  };

  return (
    <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Artwork Finder</h1>

      {/* --- Image Upload Section --- */}
      <ImageUploader
        onImageRead={handleImageReady}
        onError={handleImageError}
      />

      {/* --- Action Button --- */}
      {/* Only show button if an image has been successfully read */}
      {imageBase64 && (
        <button
          onClick={identifyArtwork}
          disabled={status === "processing"}
          style={{ padding: "10px 15px", fontSize: "16px", cursor: "pointer" }}
        >
          {status === "processing" ? "Identifying..." : "Identify Artwork"}
        </button>
      )}

      {/* --- Status and Result Display --- */}
      <div id="status-area" style={{ marginTop: "15px" }}>
        {status === "error" && (
          <p style={{ color: "red" }}>Error: {errorMsg}</p>
        )}
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h2>Result:</h2>
      <div
        id="results-area"
        style={{ minHeight: "50px", background: "#f8f8f8", padding: "10px" }}
      >
        {status === "processing" && <p>Loading result from n8n...</p>}
        {status === "success" && apiResult && (
          <div>
            {/* Basic display - Adapt based on your final n8n JSON structure */}
            <pre>{JSON.stringify(apiResult, null, 2)}</pre>
            {/* Add button to save *this specific result* */}
            {apiResult.id && ( // Only show save if result looks valid
              <button
                onClick={() => saveToFavorites(apiResult)}
                style={{ marginTop: "10px" }}
              >
                Save to Favorites
              </button>
            )}
          </div>
        )}
        {status !== "processing" && !apiResult && (
          <p>Upload an image and click identify.</p>
        )}
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* --- Favorites Section --- */}
      <h2>Favorites:</h2>
      <button onClick={displayFavorites} style={{ marginBottom: "10px" }}>
        Show/Refresh Favorites
      </button>
      <div
        id="favorites-area"
        style={{ minHeight: "50px", background: "#eee", padding: "10px" }}
      >
        {/* Favorites display will be rendered by displayFavorites() logic */}
        <p>Favorites list placeholder...</p>
      </div>
    </main>
  );
}
