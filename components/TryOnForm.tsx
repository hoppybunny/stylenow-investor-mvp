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
import 'swiper/css/effect-fade';
import { Navigation } from 'swiper/modules';
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ImageFallback } from "@/components/ui/image-fallback";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

      // Prepare the payload for email notification.
      const emailPayload = {
        formId: galleryData.id, // or any identifier you have for the submission
        timestamp: new Date().toISOString(),
      };

      // Invoke the Edge Function to send the email.
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
        body: emailPayload,
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
        // Optionally, inform the user or handle logging.
      }
      
      // Show success modal instead of toast.
      setShowSuccessModal(true);
      
      // Redirect after a brief timeout.
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/");
      }, 5000);

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
    <>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription className="text-center py-4">
              You'll receive a mail with the results in the next 24hs
              <p className="mt-2">Thanks!</p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light">Model Image</h2>
            <button
              type="button"
              onClick={scrollToGuidelines}
              className="text-neutral-500 hover:text-neutral-700 transition-colors"
              title="View Photo Guidelines"
            >
              <QuestionMarkCircleIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6 bg-neutral-50/50 rounded-lg p-6">
            <div className="flex gap-6">
              <label className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors",
                watch("imageSelection") === "upload" 
                  ? "bg-white shadow-sm ring-1 ring-neutral-200" 
                  : "hover:bg-white/50"
              )}>
                <input 
                  type="radio" 
                  value="upload" 
                  {...register("imageSelection")} 
                  className="h-4 w-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                />
                <span className="text-sm font-medium">Upload Image</span>
              </label>
              
              <label className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors",
                watch("imageSelection") === "select" 
                  ? "bg-white shadow-sm ring-1 ring-neutral-200" 
                  : "hover:bg-white/50"
              )}>
                <input 
                  type="radio" 
                  value="select" 
                  {...register("imageSelection")} 
                  className="h-4 w-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                />
                <span className="text-sm font-medium">Select Previous</span>
              </label>
            </div>

            <div className="flex gap-4 min-h-[400px]">
              <div 
                {...getRootProps()} 
                className={cn(
                  "flex-col items-center justify-center w-full rounded-lg border-2 border-dashed transition-all duration-200",
                  watch("imageSelection") === "upload" ? "flex" : "hidden",
                  uploadedFile 
                    ? "border-neutral-900 bg-white" 
                    : "border-neutral-300 bg-white/50 hover:border-neutral-400 hover:bg-white/80"
                )}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <img 
                    src={URL.createObjectURL(uploadedFile)} 
                    alt="Uploaded" 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <p className="text-sm font-medium">Drag & drop your image here</p>
                    <p className="text-xs text-neutral-500">or click to browse</p>
                  </div>
                )}
              </div>

              <div className={cn(
                "w-full",
                watch("imageSelection") !== "select" && "hidden"
              )}>
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={12}
                  slidesPerView="auto"
                  navigation
                  className="!w-full rounded-lg"
                >
                  <style jsx global>{`
                    .swiper-button-next,
                    .swiper-button-prev {
                      background: rgba(255, 255, 255, 0.9);
                      border-radius: 50%;
                      width: 40px;
                      height: 40px;
                      margin: 0;
                      top: 50%;
                      transform: translateY(-50%);
                    }

                    .swiper-button-next {
                      right: 0;
                    }

                    .swiper-button-prev {
                      left: 0;
                    }

                    .swiper-button-next::after,
                    .swiper-button-prev::after {
                      font-size: 18px;
                      color: #171717;
                    }

                    .swiper-slide {
                      width: calc(33.33% - 8px);
                      height: 400px;
                    }

                    @media (max-width: 768px) {
                      .swiper-slide {
                        width: calc(50% - 8px);
                      }
                    }

                    @media (max-width: 640px) {
                      .swiper-slide {
                        width: calc(100% - 8px);
                      }
                    }
                  `}</style>
                  
                  {previousBaseImages.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div 
                        className={cn(
                          "relative h-full rounded-lg overflow-hidden cursor-pointer transition-all duration-200"
                        )}
                        onClick={() => setSelectedImage(img)}
                      >
                        <div className="w-full h-full bg-neutral-100">
                          <img 
                            src={img.publicUrl} 
                            alt={`Model ${index}`} 
                            className={cn("w-full h-full object-cover", 
                              selectedImage?.publicUrl === img.publicUrl 
                            ? "opacity-100 neutral-900" 
                            : "opacity-25 hover:opacity-80"
                            )}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex items-center justify-center bg-neutral-100';
                              fallback.innerHTML = `
                                <svg class="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              `;
                              target.parentElement?.appendChild(fallback);
                            }}
                          />
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-light">Try-On Links</h2>
          <div className="flex gap-6">
            <label className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors",
              watch("linkSelection") === "topBottom" 
                ? "bg-white shadow-sm ring-1 ring-neutral-200" 
                : "hover:bg-white/50"
            )}>
              <input
                type="radio"
                value="topBottom"
                {...register("linkSelection")}
                className="h-4 w-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
              />
              <span className="text-sm font-medium">Top & Bottom Links</span>
            </label>
            
            <label className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors",
              watch("linkSelection") === "fullBody" 
                ? "bg-white shadow-sm ring-1 ring-neutral-200" 
                : "hover:bg-white/50"
            )}>
              <input
                type="radio"
                value="fullBody"
                {...register("linkSelection")}
                className="h-4 w-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
              />
              <span className="text-sm font-medium">Full-Body Link</span>
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

        <Button 
          type="submit" 
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white" 
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Create Look
        </Button>
      </form>
    </>
  );
}
