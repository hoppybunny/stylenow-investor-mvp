import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";

import ImageGallery from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export default async function Index() {

  if(!packsIsEnabled) {
    redirect('/overview')
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        id="train-model-container"
        className="flex flex-1 flex-col gap-2 px-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Image Gallery</CardTitle>
            <CardDescription>
              Take a look at the images you've created
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <ImageGallery />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
