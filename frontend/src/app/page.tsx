import { Upload } from "@/components/ImageUploader";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            glimpse
          </h1>
          <p className="text-gray-500 md:text-xl">see art, learn everything</p>
        </div>

        <Upload />

        <div className="pt-4">
          <Button asChild variant="outline" className="w-full">
            <a href="/favourites">browse your collection</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
