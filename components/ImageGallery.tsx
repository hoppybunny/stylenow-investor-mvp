import { Card, CardContent } from "@/components/ui/card";

export default function ImageGallery() {
  // This array is empty now, but you can populate it with image objects later
  const images: { id: string; url: string; alt: string }[] = []

  return (
    <div className="p-4">
      {images.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No images to display</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardContent className="p-0">
                <img src={image.url || "/placeholder.svg"} alt={image.alt} className="w-full h-48 object-cover" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}