"use client";

import { Button } from "@/components/ui/button";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

// Define the FormDataType interface
interface FormDataType {
  imageSelection: string;
  linkSelection: string;
  topLink?: string;
  bottomLink?: string;
  fullBodyLink?: string;
  jacketLink?: string;
  shoesLink?: string;
}

interface StorageImage {
  fileName: string;
  publicUrl: string;
}

const supabase = createClientComponentClient()

// Update URL validation function to handle URLs without protocol
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function TryOnForm() {
  const router = useRouter();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormDataType>({
    defaultValues: {
      imageSelection: "upload", // Default to upload option
      linkSelection: "topBottom" // Default to top/bottom option
    }
  });
  const [selectedImage, setSelectedImage] = useState<StorageImage | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previousBaseImages, setPreviousBaseImages] = useState<StorageImage[]>([]);

  useEffect(() => {
    const fetchBaseImages = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id;
      const { data, error } = await supabase.storage.from("uploads").list(`${userId}/base_model/`)
      if (error) {
        toast({ title: "Error", description: error.message, duration: 5000 });
        return;
      }

      const tmpBaseImages = (await Promise.all(data.map(async (file) => {
        const { data: urlData } = await supabase.storage
          .from("uploads")
          .createSignedUrl(`${userId}/base_model/${file.name}`, 60);
        return {
          fileName: file.name,
          publicUrl: urlData?.signedUrl
        };
      }))).filter((img): img is StorageImage => img.publicUrl !== undefined);
      
      setPreviousBaseImages(tmpBaseImages);
    };
    fetchBaseImages();
  }, []);

  // Add this useEffect to update slider when images are loaded
  useEffect(() => {
    if (previousBaseImages.length > 0) {
      const loadImages = async () => {
        const imagePromises = previousBaseImages.map((img) => {
          return new Promise((resolve) => {
            const image = new Image();
            image.src = img.publicUrl;
            image.onload = () => resolve(true);
            image.onerror = () => resolve(false);
          });
        });

        await Promise.all(imagePromises);
      };

      loadImages();
    }
  }, [previousBaseImages]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);
    setSelectedImage(null);
    setValue("imageSelection", "upload");
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
    onDrop,
  });

  const uploadToSupabase = useCallback(async () => {

    if (!uploadedFile) {
      setIsLoading(false);
      throw new Error("Please upload an image")
    }

    setIsLoading(true);
    const uploadedUrls = [];
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id;


    const uuidFilename = uuidv4();
    const { data, error } = await supabase.storage.from("uploads").upload(`${userId}/base_model/${uuidFilename}`, uploadedFile);
    if (error) {
      toast({ title: "Upload failed", description: error.message, duration: 5000 });
      setIsLoading(false);
      return;
    }
    uploadedUrls.push(data?.path);

    setIsLoading(false);

    return uuidFilename

  }, [uploadedFile]);

  const onSubmit: SubmitHandler<FormDataType> = async (data) => {
    try {
      // Image validation
      if (data.imageSelection === "upload" && !uploadedFile) {
        toast({
          title: "Error",
          description: "Please upload an image",
          variant: "destructive"
        });
        return;
      }

      if (data.imageSelection === "select" && !selectedImage) {
        toast({
          title: "Error",
          description: "Please select an image from previous uploads",
          variant: "destructive"
        });
        return;
      }

      // Link validation
      const hasValidJacket = data.jacketLink && isValidUrl(data.jacketLink);
      const hasValidShoes = data.shoesLink && isValidUrl(data.shoesLink);

      if (data.linkSelection === "topBottom") {
        const hasValidTop = data.topLink && isValidUrl(data.topLink);
        const hasValidBottom = data.bottomLink && isValidUrl(data.bottomLink);
        
        if (!hasValidTop && !hasValidBottom && !hasValidJacket && !hasValidShoes) {
          toast({
            title: "Error",
            description: "Please provide at least one valid garment URL",
            variant: "destructive"
          });
          return;
        }
      } else if (data.linkSelection === "fullBody") {
        const hasValidFullBody = data.fullBodyLink && isValidUrl(data.fullBodyLink);
        
        if (!hasValidFullBody && !hasValidJacket && !hasValidShoes) {
          toast({
            title: "Error",
            description: "Please provide at least one valid garment URL",
            variant: "destructive"
          });
          return;
        }
      }

      const galleryDataBaseEntry = {
        base_photo: "",
        top_garment: "",
        bottom_garment: "",
        full_body_garment: "",
        jacket: "",
        shoes: "",
        generated_photo: "",
      };

      if (data.imageSelection === "upload") {
        //TODO: handle unhappy paths
        const basePhotoUuid = await uploadToSupabase()
        if (basePhotoUuid) {
          galleryDataBaseEntry.base_photo = basePhotoUuid
        }
      }

      if (data.imageSelection === "select") {
        if(selectedImage?.fileName)  {
          galleryDataBaseEntry.base_photo = selectedImage.fileName
        }
      }

      if (data.linkSelection === "topBottom") {
        galleryDataBaseEntry.top_garment = data.topLink || "";
        galleryDataBaseEntry.bottom_garment = data.bottomLink || "";
      }

      if (data.linkSelection === "fullBody") {
        galleryDataBaseEntry.full_body_garment = data.fullBodyLink || "";
      }

      galleryDataBaseEntry.jacket = data.jacketLink || ""
      galleryDataBaseEntry.shoes = data.shoesLink || ""

      // Insert into gallery table
      const { data: galleryData, error } = await supabase
        .from('gallery')
        .insert(galleryDataBaseEntry)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your try-on request has been submitted successfully.",
        duration: 5000
      });

      router.push("/");
      console.log("Form Submitted:", data);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }

  };

  const scrollToGuidelines = () => {
    const element = document.getElementById("photo-guidelines");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full mx-auto p-6 border rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        Model Image
        <span onClick={scrollToGuidelines} className="ml-2 cursor-pointer" title="View Photo Guidelines">
          ❓
        </span>
      </h2> 
      <p className="text-sm text-gray-500 mb-2">Choose either to upload a new image OR select from previously uploaded images.</p>
      <div className="mb-4">
        <label className="flex items-center">
          <input type="radio" value="upload" {...register("imageSelection")} defaultChecked /> Upload Image
        </label>
        <label className="flex items-center">
          <input type="radio" value="select" {...register("imageSelection")} /> Select from previous images
        </label>
      </div>
      <div className="flex gap-4 h-36 items-center">
        <div {...getRootProps()} className={`${watch("imageSelection") == "upload" ? "flex" : "hidden"} flex items-center justify-center h-32 border-2 w-full border-dashed p-6 rounded-lg cursor-pointer text-center ${uploadedFile ? 'border-blue-500' : ''}`}>
          <input {...getInputProps()} />
          {uploadedFile ? (
            <img src={URL.createObjectURL(uploadedFile)} alt="Uploaded" className="w-full h-32 object-contain rounded-lg" />
          ) : (
            <p>Drag & drop or click to upload</p>
          )}
        </div>
        <div hidden={watch("imageSelection") !== "select"}>
          <div className="w-full max-w-full">
            <Swiper
              modules={[Navigation]}
              spaceBetween={10}
              slidesPerView={3}
              navigation
              className="mySwiper !w-full"
              style={{ width: '100%' }}
            >
              {previousBaseImages.map((img, index) => (
                <SwiperSlide key={index} className="!w-[calc(33.33%-7px)]">
                  <div 
                    className={`border-2 rounded-lg cursor-pointer p-1 ${
                      selectedImage?.publicUrl === img.publicUrl ? "border-blue-500" : ""
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img 
                      src={img.publicUrl} 
                      alt={`Model ${index}`} 
                      className="w-full h-32 object-cover rounded-lg" 
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-bold mt-6 mb-4">Try-On Links</h2>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            value="topBottom"
            {...register("linkSelection")}
            defaultChecked
          /> Top & Bottom Links
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            value="fullBody"
            {...register("linkSelection")}
          /> Full-Body Link
        </label>
      </div>
      <div className="mb-4" hidden={watch("linkSelection") !== "topBottom"}>
        <input 
          {...register("topLink", {
            validate: (value) => !value || isValidUrl(value) || "Please enter a valid URL"
          })}
          type="text" 
          placeholder="Top Link" 
          className={`w-full p-2 border rounded-md ${errors.topLink ? 'border-red-500' : ''}`}
        />
        {errors.topLink && <p className="text-red-500 text-sm mt-1">{errors.topLink.message}</p>}
        
        <input 
          {...register("bottomLink", {
            validate: (value) => !value || isValidUrl(value) || "Please enter a valid URL"
          })}
          type="text" 
          placeholder="Bottom Link" 
          className={`w-full p-2 border rounded-md mt-2 ${errors.bottomLink ? 'border-red-500' : ''}`}
        />
        {errors.bottomLink && <p className="text-red-500 text-sm mt-1">{errors.bottomLink.message}</p>}
      </div>
      <div className="mb-4" hidden={watch("linkSelection") !== "fullBody"}>
        <input 
          {...register("fullBodyLink", {
            validate: (value) => !value || isValidUrl(value) || "Please enter a valid URL"
          })}
          type="text" 
          placeholder="Full Body Link" 
          className={`w-full p-2 border rounded-md ${errors.fullBodyLink ? 'border-red-500' : ''}`}
        />
        {errors.fullBodyLink && <p className="text-red-500 text-sm mt-1">{errors.fullBodyLink.message}</p>}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-4">Combine</h2>
      <div className="mb-4">
        <label className="block font-medium">Jacket Link</label>
        <input 
          {...register("jacketLink", {
            validate: (value) => !value || isValidUrl(value) || "Please enter a valid URL"
          })}
          type="text" 
          placeholder="Jacket Link" 
          className={`w-full p-2 border rounded-md ${errors.jacketLink ? 'border-red-500' : ''}`}
        />
        {errors.jacketLink && <p className="text-red-500 text-sm mt-1">{errors.jacketLink.message}</p>}
      </div>

      <h2 className="text-xl font-bold mt-6 mb-4">Shoes</h2>
      <div className="mb-4">
        <label className="block font-medium">Shoes Link</label>
        <input 
          {...register("shoesLink", {
            validate: (value) => !value || isValidUrl(value) || "Please enter a valid URL"
          })}
          type="text" 
          placeholder="Shoes Link" 
          className={`w-full p-2 border rounded-md ${errors.shoesLink ? 'border-red-500' : ''}`}
        />
        {errors.shoesLink && <p className="text-red-500 text-sm mt-1">{errors.shoesLink.message}</p>}
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>Upload to Supabase</Button>
    </form>
  );
}
