
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import TryOnForm from "../TryOnForm";

export default async function Index() {

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        id="train-model-container"
        className="flex flex-1 flex-col gap-2 px-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Virtual dress room</CardTitle>
            <CardDescription>
              You will be able to try-on clothes on them
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <TryOnForm/>
            {/* <TrainModelZone /> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle id="photo-guidelines">Photo guidelines</CardTitle>
            <div>
              Please follow these guidelines for best results
              <div className="flex flex-col md:flex-row" >
                <div className="md:w-1/2">
                  <Image src="/guidelines/ideal_photos.png" alt="ideal photos example" width={500} height={500} />
                  <Image src="/guidelines/bad_photos.png" alt="bad photos example" width={500} height={500} />
                </div>

                <ul className="list-disc pl-5">
                  <li>
                    Keep the look simple and natural
                    <div className="text-xs">
                      (avoid accessories like masks, collars, scarves, or sunglasses)
                    </div>
                  </li>
                  <li>
                    Keep hair and objects away from the clothing
                    <div className="text-xs">
                      Ensure the outfit is fully visible
                    </div>
                  </li>
                  <li>
                    Opt for fitted clothing for the best results
                    <div className="text-xs">
                      (avoid jackets, baggy, or oversized garments)
                    </div>
                  </li>
                  <li>
                    Pose facing the front or at a three-quarter angle
                  </li>
                  <li>
                    Take a full-body shot
                  </li>
                  <li>
                    Include only one person in the frame
                  </li>
                  <li>
                    Use a portrait orientation
                  </li>
                  <li>
                    Adopt a relaxed arms by side pose
                  </li>
                  <li>
                    Stand with legs uncrossed
                  </li>
                </ul>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
