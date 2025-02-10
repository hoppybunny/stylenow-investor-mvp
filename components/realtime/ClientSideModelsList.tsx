import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import TryOnForm from "../TryOnForm";
import { CheckIcon } from "@heroicons/react/24/outline";

export default async function Index() {
  return (
    <div className="space-y-8">
      <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
        <CardContent>
          <TryOnForm />
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border-neutral-200">
        <CardHeader>
          <CardTitle id="photo-guidelines" className="text-2xl font-light">Photo Guidelines</CardTitle>
          <CardDescription className="text-neutral-600">
            Follow these guidelines for best results
          </CardDescription>
          <div className="mt-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 space-y-4">
                <Image 
                  src="/guidelines/ideal_photos.png" 
                  alt="ideal photos example" 
                  width={500} 
                  height={500}
                  className="rounded-lg shadow-sm" 
                />
                <Image 
                  src="/guidelines/bad_photos.png" 
                  alt="bad photos example" 
                  width={500} 
                  height={500}
                  className="rounded-lg shadow-sm" 
                />
              </div>

              <ul className="md:w-1/2 space-y-4 text-neutral-600">
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Keep the look simple and natural</p>
                    <p className="text-sm text-neutral-500">Avoid accessories like masks, collars, scarves, or sunglasses</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Keep hair and objects away from the clothing</p>
                    <p className="text-sm text-neutral-500">Ensure the outfit is fully visible</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Opt for fitted clothing for the best results</p>
                    <p className="text-sm text-neutral-500">(avoid jackets, baggy, or oversized garments)</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pose facing the front or at a three-quarter angle</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Take a full-body shot</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Include only one person in the frame</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Use a portrait orientation</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Adopt a relaxed arms by side pose</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 rounded-full bg-neutral-100 p-1">
                    <CheckIcon className="h-4 w-4 text-neutral-600" />
                  </div>
                  <div>
                    <p className="font-medium">Stand with legs uncrossed</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
