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
    <div className="fashion-container">
      <div className="max-w-[1200px] mx-auto">
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Image Gallery</CardTitle>
            <CardDescription className="text-neutral-600">
              Take a look at the images you've created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageGallery />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
