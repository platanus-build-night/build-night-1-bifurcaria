"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Button } from "@/components/ui/Button";
import { useFavourites, Artwork } from "@/hooks/useFavourites";
import { ArtworkData } from "@/hooks/useArtworkIdentifier";

export default function ArtworkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const { addFavorite, isFavorite } = useFavourites();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Try to retrieve artwork data from sessionStorage
    if (id) {
      const storedArtwork = sessionStorage.getItem(`artwork-${id}`);

      if (storedArtwork) {
        try {
          // Convert from API structure to UI structure
          const apiData = JSON.parse(storedArtwork) as ArtworkData;

          const uiData: Artwork = {
            id: id,
            title: apiData.title,
            artist: apiData.author, // Map author to artist
            year: apiData.year,
            museum: apiData.museum, // Map museum to location
            imageUrl: "/IMG_1123.png", // Placeholder for now
          };

          setArtwork(uiData);
          setSaved(isFavorite(id));
        } catch (error) {
          console.error("Error parsing artwork data:", error);
        }
      } else {
        // If no data in sessionStorage, redirect back to upload
        console.error("No artwork data found for ID:", id);
        router.push("/");
      }
    }
  }, [id, isFavorite, router]);

  if (!artwork) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading artwork information...</p>
      </div>
    );
  }

  const handleSave = () => {
    if (artwork) {
      addFavorite(artwork);
      setSaved(true);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={handleBack}>
          <ArrowBackIcon className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={artwork.imageUrl || "/placeholder.svg"}
              width={600}
              height={400}
              alt={artwork.title}
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold md:text-3xl">
                {artwork.title}
              </h1>
              <p className="text-xl text-gray-600">
                {artwork.artist}, {artwork.year}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="col-span-1">
                  <p className="text-sm text-gray-500">Museum</p>
                  <p>{artwork.museum}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={saved} className="flex-1">
                <FavoriteIcon
                  className={`mr-2 h-4 w-4 ${saved ? "fill-current" : ""}`}
                />
                {saved ? "Saved to Favourites" : "Save to Favourites"}
              </Button>

              <Button asChild variant="outline">
                <a href="/favourites">View Favourites</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
