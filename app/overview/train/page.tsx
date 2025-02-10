import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Index({ params }: { params: { pack: string } }) {
  return (
    <div className="fashion-container">
      <div className="max-w-[800px] mx-auto">
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Train Your Model</CardTitle>
            <CardDescription className="text-neutral-600">
              Upload images of yourself to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Your form content here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
