"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Define the API response structure based on the provided fields
export interface ArtworkData {
  title: string;
  author: string; // Note: Called 'artist' in the UI, but 'author' in API
  year: string;
  museum: string; // Called 'location' in the UI
  id?: string;
}

export function useArtworkIdentifier() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const identifyArtwork = async (imageBase64: string) => {
    // Check if URL is configured
    if (!process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL) {
      setErrorMsg("Error: n8n Webhook URL not configured in frontend code.");
      setStatus("error");
      return;
    }

    setStatus("processing");
    setLoading(true);
    setErrorMsg(null);

    try {
      console.log(
        "Sending request to:",
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
      );

      // Extract the base64 data by removing the data URL prefix
      const base64Data = imageBase64.split(",")[1] || "";

      const response = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData: base64Data }),
      });

      console.log("Received response status:", response.status);

      // Clone the response to read the text content for debugging
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        let errorText = `API Error: ${response.status}`;
        try {
          const errorJson = await response.json();
          errorText += ` - ${errorJson.message || JSON.stringify(errorJson)}`;
        } catch {
          errorText += ` - ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response received from server");
      }

      try {
        const result = JSON.parse(responseText) as ArtworkData;
        console.log("API Result Received:", result);

        setStatus("success");

        // Generate a unique ID for the artwork if not provided
        const artworkId = result.id || `artwork-${Date.now()}`;

        // Navigate to the artwork page with the data
        router.push(`/artwork?id=${artworkId}`);

        // Store the result in sessionStorage for the artwork page to retrieve
        sessionStorage.setItem(`artwork-${artworkId}`, JSON.stringify(result));

        return result;
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
    } finally {
      setLoading(false);
    }
  };

  return {
    identifyArtwork,
    loading,
    status,
    errorMsg,
  };
}
