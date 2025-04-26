"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Button } from "@/components/ui/Button";
import { useFavourites } from "@/hooks/useFavourites";

// Mock data for the artwork (in a real app, this would come from your n8n API)
const mockArtwork = {
  id: "123",
  title: "Starry Night",
  artist: "Vincent van Gogh",
  year: "1889",
  medium: "Oil on canvas",
  dimensions: "73.7 cm × 92.1 cm",
  location: "Museum of Modern Art, New York City",
  description:
    "The Starry Night is an oil on canvas painting by Dutch Post-Impressionist painter Vincent van Gogh. Painted in June 1889, it depicts the view from the east-facing window of his asylum room at Saint-Rémy-de-Provence, just before sunrise, with the addition of an imaginary village.",
  imageUrl: "/placeholder.svg?height=800&width=600",
};

export default function ArtworkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [artwork, setArtwork] = useState<typeof mockArtwork | null>(null);
  const { addFavorite, isFavorite } = useFavourites();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the artwork data from your API
    // For this MVP, we'll use the mock data
    setArtwork(mockArtwork);

    // Check if this artwork is already in favourites
    if (id) {
      setSaved(isFavorite(id));
    }
  }, [id, isFavorite]);

  if (!artwork) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading artwork information...</p>
      </div>
    );
  }

  const handleSave = () => {
    addFavorite(artwork);
    setSaved(true);
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
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={artwork.imageUrl || "/placeholder.svg"}
              alt={artwork.title}
              fill
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Medium</p>
                  <p>{artwork.medium}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dimensions</p>
                  <p>{artwork.dimensions}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Location</p>
                  <p>{artwork.location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="mt-1">{artwork.description}</p>
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
