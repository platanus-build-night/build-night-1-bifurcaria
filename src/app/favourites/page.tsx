"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@/components/ui/Button";
import { useFavourites } from "@/hooks/useFavourites";

export default function FavouritesPage() {
  const { favourites, removeFavorite } = useFavourites();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Button asChild variant="ghost" size="sm" className="mr-4">
              <Link href="/">
                <ArrowBackIcon className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Your Saved Artworks
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {favourites.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 rounded-lg border border-dashed p-8 text-center">
            <p className="text-lg text-gray-500">
              You have not saved any artworks yet.
            </p>
            <Button asChild>
              <Link href="/">Discover Artworks</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {favourites.map((artwork) => (
              <div
                key={artwork.id}
                className="group relative overflow-hidden rounded-lg border"
              >
                <Link href={`/artwork?id=${artwork.id}`}>
                  <div className="aspect-[3/4] w-full overflow-hidden">
                    <Image
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={artwork.title}
                      width={300}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="ml-auto h-8 w-8 self-start"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFavorite(artwork.id);
                    }}
                  >
                    <DeleteIcon className="h-4 w-4" />
                  </Button>

                  <div className="text-white">
                    <h3 className="font-medium">{artwork.title}</h3>
                    <p className="text-sm text-gray-200">{artwork.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
