"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaImages } from "react-icons/fa";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { fileUploadFormSchema } from "@/types/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type FormInput = z.infer<typeof fileUploadFormSchema>;

export default function TrainModelZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormInput>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: {
      name: "",
      type: "man",
    },
  });

  const onSubmit: SubmitHandler<FormInput> = () => {
    uploadToSupabase();
  };

  const uploadToSupabase = useCallback(async () => {
    setIsLoading(true);
    const uploadedUrls = [];
    const userId = (await supabase.auth.getUser()).data.user?.id;

    for (const file of files) {
      const uuidFilename = uuidv4();
      const { data, error } = await supabase.storage.from("uploads").upload(`${userId}/${uuidFilename}`, file);
      if (error) {
        toast({ title: "Upload failed", description: error.message, duration: 5000 });
        setIsLoading(false);
        return;
      }
      uploadedUrls.push(data?.path);
    }

    setIsLoading(false);
    toast({ title: "Upload successful", description: "Images have been uploaded to Supabase.", duration: 5000 });
    router.push("/");
  }, [files]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.filter(
        (file) => !files.some((f) => f.name === file.name)
      );

      if (newFiles.length + files.length > 10) {
        toast({ title: "Too many images", description: "You can only upload up to 10 images.", duration: 5000 });
        return;
      }

      setFiles([...files, ...newFiles]);
      toast({ title: "Images selected", description: "Files added successfully.", duration: 5000 });
    },
    [files]
  );

  const removeFile = useCallback((file: File) => {
    setFiles(files.filter((f) => f.name !== file.name));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-md flex flex-col gap-8">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="w-full rounded-md">
              <FormLabel>Name</FormLabel>
              <FormDescription>Give your model a name.</FormDescription>
              <FormControl><Input placeholder="e.g. clara-model" {...field} className="max-w-screen-sm" autoComplete="off" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <div {...getRootProps()} className="rounded-md cursor-pointer flex flex-col gap-4">
            <FormLabel>Samples</FormLabel>
            <FormDescription>Upload 4-10 images.</FormDescription>
            <div className="outline-dashed outline-2 outline-gray-100 hover:outline-blue-500 w-full h-full rounded-md p-4 flex justify-center align-middle">
              <input {...getInputProps()} />
              {isDragActive ? <p>Drop files here ...</p> : <div className="flex flex-col items-center gap-2"><FaImages size={32} className="text-gray-700" /><p>Drag & drop or click to upload.</p></div>}
            </div>
          </div>
          {files.length > 0 && files.map((file) => (
            <div key={file.name} className="flex flex-col gap-1">
              <img src={URL.createObjectURL(file)} className="rounded-md w-24 h-24 object-cover" />
              <Button variant="outline" size="sm" onClick={() => removeFile(file)}>Remove</Button>
            </div>
          ))}
          <Button type="submit" className="w-full" isLoading={isLoading}>Upload to Supabase</Button>
        </form>
      </Form>
    </div>
  );
}
