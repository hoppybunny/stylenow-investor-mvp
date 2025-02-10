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
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaImages } from "react-icons/fa";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { fileUploadFormSchema } from "@/types/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid';
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";

const supabase = createClientComponentClient()


type FormInput = z.infer<typeof fileUploadFormSchema>;

export default function TrainModelZone() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const [fullBody, setFullBody] = useState<boolean>(false);
  const [uploadNewPhoto, setUploadNewPhoto] = useState<boolean>(false);
  const [baseImages, setBaseImages] = useState<string[]>([]);


  useEffect(() => {
    const fetchBaseImages = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id;
      const { data, error } = await supabase.storage.from("uploads").list(`${userId}/base_model`);
      if (error) {
        toast({ title: "Error", description: error.message, duration: 5000 });
        return;
      }
      const tmpBaseImages = data.map((file) => file.name)
      tmpBaseImages.push("https://images.freeimages.com/vhq/images/previews/d50/butterfly-papilio-philenor-side-clip-art-545705.jpg?fmt=webp&h=350")
      setBaseImages(tmpBaseImages);
    };
    fetchBaseImages();
  }, []);

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
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id;

    for (const file of files) {
      const uuidFilename = uuidv4();
      const { data, error } = await supabase.storage.from("uploads").upload(`${userId}/base_model/${uuidFilename}`, file);
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
          <RadioGroup onValueChange={(value) => setUploadNewPhoto(value === "true")}>
            <RadioGroupItem
              className="w-[25px] h-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
              value="true" id="disabled" />
            <div {...getRootProps()} className={`rounded-md cursor-pointer flex flex-col gap-4 ${!uploadNewPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <FormLabel>Photo</FormLabel>
              <FormDescription>Upload your model photo</FormDescription>
              <div className="outline-dashed outline-2 outline-gray-100 hover:outline-blue-500 w-full h-full rounded-md p-4 flex justify-center align-middle">
                <input {...getInputProps()} disabled={!uploadNewPhoto} />
                {isDragActive ? <p>Drop file here ...</p> : <div className="flex flex-col items-center gap-2"><FaImages size={32} className="text-gray-700" /><p>Drag & drop or click to upload.</p></div>}
              </div>
            </div>
            {files.length > 0 && files.map((file) => (
              <div key={file.name} className="flex flex-col gap-1">
                <img src={URL.createObjectURL(file)} className="rounded-md w-24 h-24 object-cover" />
                <Button variant="outline" size="sm" onClick={() => removeFile(file)}>Remove</Button>
              </div>
            ))}
            <Button type="submit" className="w-full" isLoading={isLoading}>Upload to Supabase</Button>

            <div >
              <RadioGroupItem
                className="w-[25px] h-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
                value="true" id="disabled" />
              <div className="flex flex-col md:flex-row">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="w-full rounded-md">
                    <FormDescription>Gallery of previous uploaded photos</FormDescription>
                    <FormControl><Input placeholder="e.g. clothes-store.com/white-t-shirt" {...field} className="max-w-screen-sm" autoComplete="off" /></FormControl>
                    <FormMessage />
                    <div className="overflow-x-auto">
                      <input type="radio" name="baseImage" value="imageUuid" style={{
                        backgroundImage: `url(
                        ${baseImages}
                      )`}} />
                    </div>
                  </FormItem>
                )} />
              </div>
            </div>
          </RadioGroup>


          <FormLabel>Try-on</FormLabel>
          <RadioGroup onValueChange={(value) => setFullBody(value === "true")}>
            <div>
              <RadioGroupItem
                className="w-[25px] h-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
                value="false" id="disabled" />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="w-full rounded-md">
                  <FormDescription>Top garment</FormDescription>
                  <FormControl><Input placeholder="e.g. clothes-store.com/white-t-shirt" {...field} className="max-w-screen-sm" autoComplete="off" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="w-full rounded-md">
                  <FormDescription>Bottom garment</FormDescription>
                  <FormControl><Input placeholder="e.g. clothes-store.com/blue-jeans" {...field} className="max-w-screen-sm" autoComplete="off" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div>
              <RadioGroupItem
                className="w-[25px] h-[25px] cursor-default rounded-full bg-white shadow-[0_2px_10px] shadow-blackA4 outline-none hover:bg-violet3 focus:shadow-[0_0_0_2px] focus:shadow-black"
                value="true" id="enabled" />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="w-full rounded-md">
                  <FormDescription>Full-body</FormDescription>
                  <FormControl><Input placeholder="e.g. clothes-store.com/party-dress" {...field} className="max-w-screen-sm" autoComplete="off" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </RadioGroup>


          <FormLabel>Combine</FormLabel>
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="w-full rounded-md">
              <FormDescription>Jacket</FormDescription>
              <FormControl><Input placeholder="e.g. clothes-store.com/warm-jacket" {...field} className="max-w-screen-sm" autoComplete="off" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormLabel>Shoes</FormLabel>
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="w-full rounded-md">
              <FormDescription>Shoes</FormDescription>
              <FormControl><Input placeholder="e.g. clothes-store.com/fancy-shoes" {...field} className="max-w-screen-sm" autoComplete="off" /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

        </form>
      </Form>
    </div>
  );
}
