import TrainModelZone from "@/components/TrainModelZone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Index({ params }: { params: { pack : string } }) {
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        id="train-model-container"
        className="flex flex-1 flex-col gap-2 px-2"
      >
        <Card>
          <CardHeader>
            <CardTitle>Train Model</CardTitle>
            <CardDescription>
              Upload images of yourself to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <TrainModelZone />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
