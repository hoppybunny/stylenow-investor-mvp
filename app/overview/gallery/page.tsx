import ImageGallery from "@/components/ImageGallery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Index() {
  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
      <Card className="bg-white/50 backdrop-blur-sm">
        <CardHeader className="px-6 sm:px-8">
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription className="text-neutral-600">
            Take a look at the images you've created
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ImageGallery />
        </CardContent>
      </Card>
    </div>
  );
}
