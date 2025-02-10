"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Database } from "@/types/supabase";
import { Icons } from "./icons";
import { useRouter } from "next/navigation";
import { modelRowWithSamples } from "@/types/utils";

type ModelsTableProps = {
  models: modelRowWithSamples[];
};

export default async function ModelsTable({ models }: ModelsTableProps) {
  const router = useRouter();
  const handleRedirect = (id: number) => {
    router.push(`/overview/models/${id}`);
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-white/50 backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-light text-neutral-600">Name</TableHead>
            <TableHead className="font-light text-neutral-600">Status</TableHead>
            <TableHead className="font-light text-neutral-600">Type</TableHead>
            <TableHead className="font-light text-neutral-600">Samples</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models?.map((model) => (
            <TableRow
              key={model.modelId}
              onClick={() => handleRedirect(model.id)}
              className="cursor-pointer transition-colors hover:bg-neutral-50"
            >
              <TableCell className="font-medium">{model.name}</TableCell>
              <TableCell>
                <div>
                  <Badge
                    className="flex gap-2 items-center w-min"
                    variant={model.status === "finished" ? "default" : "secondary"}
                  >
                    {model.status === "processing" ? "training" : model.status}
                    {model.status === "processing" && (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    )}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-neutral-600">{model.type}</TableCell>
              <TableCell>
                <div className="flex gap-2 flex-shrink-0 items-center">
                  {model.samples.slice(0, 3).map((sample) => (
                    <Avatar key={sample.id} className="border border-neutral-200">
                      <AvatarImage src={sample.uri} className="object-cover" />
                    </Avatar>
                  ))}
                  {model.samples.length > 3 && (
                    <Badge className="rounded-full h-10 bg-neutral-100 text-neutral-600 border-0" variant="outline">
                      +{model.samples.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
