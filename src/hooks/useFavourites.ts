"use client";

import { useState, useEffect, useCallback } from "react";

// Define the artwork type to match the UI structure
export type Artwork = {
  id: string;
  title: string;
  artist: string;
  year: string;
  museum: string;
  imageUrl?: string;
  // Keep optional fields for backward compatibility with any existing favorites
  medium?: string;
  dimensions?: string;
  location?: string;
  description?: string;
};

export function useFavourites() {
  const [favourites, setFavourites] = useState<Artwork[]>([]);

  // Load favourites from localStorage on mount
  useEffect(() => {
    const storedFavourites = localStorage.getItem("favourites");
    if (storedFavourites) {
      try {
        setFavourites(JSON.parse(storedFavourites));
      } catch (error) {
        console.error("Failed to parse favourites from localStorage:", error);
        localStorage.removeItem("favourites");
      }
    }
  }, []);

  // Save favourites to localStorage whenever they change
  useEffect(() => {
    if (favourites.length > 0) {
      localStorage.setItem("favourites", JSON.stringify(favourites));
    }
  }, [favourites]);

  // Add a new favorite
  const addFavorite = useCallback((artwork: Artwork) => {
    setFavourites((prev) => {
      // Check if the artwork is already in favourites
      if (prev.some((item) => item.id === artwork.id)) {
        return prev;
      }
      return [...prev, artwork];
    });
  }, []);

  // Remove a favorite
  const removeFavorite = useCallback(
    (id: string) => {
      setFavourites((prev) => prev.filter((item) => item.id !== id));

      // If favourites will be empty, remove the item from localStorage
      const updatedFavourites = favourites.filter((item) => item.id !== id);
      if (updatedFavourites.length === 0) {
        localStorage.removeItem("favourites");
      }
    },
    [favourites]
  );

  // Check if an artwork is in favourites
  const isFavorite = useCallback(
    (id: string) => {
      return favourites.some((item) => item.id === id);
    },
    [favourites]
  );

  return {
    favourites,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
