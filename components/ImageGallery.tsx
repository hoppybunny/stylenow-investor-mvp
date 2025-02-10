"use client"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "./ui/use-toast";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Icons } from "./icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// Define types for our gallery items
type GalleryItem = {
  id: number;
  created_at: string;
  base_photo: string | null;
  top_garment: string | null;
  bottom_garment: string | null;
  full_body_garment: string | null;
  jacket: string | null;
  shoes: string | null;
  generated_photo: string;
  user_id: string;
}

const supabase = createClientComponentClient()

export default function ImageGallery() {
  const [galleryItems, setGalleryItems] = useState<(GalleryItem & { imageUrl: string })[]>([]);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({ title: "Error", description: "User not authenticated", duration: 5000 });
          return;
        }

        // Fetch gallery items for current user
        const { data: galleryData, error: galleryError } = await supabase
          .from('gallery')
          .select('*')
          .eq('user_id', user.id)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (galleryError) {
          toast({ title: "Error", description: galleryError.message, duration: 5000 });
          return;
        }

        // Get signed URLs for generated photos
        const itemsWithUrls = await Promise.all(galleryData.map(async (item) => {
          const { data: urlData } = await supabase.storage
            .from('uploads')
            .createSignedUrl(`${user.id}/generated_photos/${item.generated_photo}`, 3600);

          return {
            ...item,
            imageUrl: urlData?.signedUrl || ''
          };
        }));

        setGalleryItems(itemsWithUrls);
        setIsLoading(false); // Set loading state to false when data is fetched
      } catch (error) {
        setIsLoading(false); // Set loading state to false on error
        toast({ title: "Error", description: "Failed to fetch gallery items", duration: 5000 });
      }
    };

    fetchGalleryItems();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('gallery')
        .update({ deleted: true })
        .eq('id', id);

      if (error) {
        toast({ title: "Error", description: "Failed to delete image", duration: 5000 });
        return;
      }

      setGalleryItems(prevItems => prevItems.filter(item => item.id !== id));
      toast({ title: "Success", description: "Image deleted successfully", duration: 5000 });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete image", duration: 5000 });
    } finally {
      setItemToDelete(null);
    }
  };

  if (isLoading) {
    // Display a loading icon when the data is being fetched
    return (
      <div className="flex justify-center">
        <Icons.spinner className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (galleryItems.length === 0) {
    // Display "No images to display" when the data is fetched but empty
    return (
      <div className="flex justify-center">
        No images to display
      </div>
    );
  }

  return (
    <div className="sm:p-4">
      <AlertDialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this entry from your gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {galleryItems.length === 0 ? (
        <div className="text-center py-12 text-neutral-500">
          <p>No images to display</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
          {galleryItems.map((item) => (
            <Card key={item.id} className="group overflow-hidden relative bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <button
                onClick={() => setItemToDelete(item.id)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </button>
              <CardContent className="p-4 sm:p-8 space-y-6">
                <div className="relative w-full aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center" id={`spinner-${item.id}`}>
                    <Icons.spinner className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                  <img
                    src={item.imageUrl}
                    alt="Generated outfit"
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-all duration-300",
                      "hover:scale-105 cursor-zoom-in"
                    )}
                    onClick={() => window.open(item.imageUrl, '_blank')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const spinnerId = `spinner-${item.id}`;
                      const spinner = document.getElementById(spinnerId);
                      if (spinner) {
                        spinner.remove();
                      }
                      const container = target.parentElement;
                      if (container) {
                        const fallback = document.createElement('div');
                        fallback.className = 'absolute inset-0 flex items-center justify-center';
                        fallback.innerHTML = `
                          <div class="flex flex-col items-center text-neutral-400">
                            <svg class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span class="text-sm">Image not found</span>
                          </div>
                        `;
                        container.appendChild(fallback);
                      }
                    }}
                    onLoad={(e) => {
                      const spinnerId = `spinner-${item.id}`;
                      const spinner = document.getElementById(spinnerId);
                      if (spinner) {
                        spinner.remove();
                      }
                    }}
                  />
                </div>
                <div className="space-y-2 text-sm text-neutral-600">
                  {item.top_garment && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Top:</span>
                      {(() => {
                        try {
                          const url = new URL(item.top_garment);
                          return (
                            <a 
                              href={item.top_garment} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 transition-colors truncate"
                            >
                              {url.hostname}
                            </a>
                          );
                        } catch {
                          return <span className="truncate">{item.top_garment}</span>;
                        }
                      })()}
                    </p>
                  )}
                  {item.bottom_garment && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Bottom:</span>
                      {(() => {
                        try {
                          const url = new URL(item.bottom_garment);
                          return (
                            <a 
                              href={item.bottom_garment} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 transition-colors truncate"
                            >
                              {url.hostname}
                            </a>
                          );
                        } catch {
                          return <span className="truncate">{item.bottom_garment}</span>;
                        }
                      })()}
                    </p>
                  )}
                  {item.full_body_garment && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Full Body:</span>
                      {(() => {
                        try {
                          const url = new URL(item.full_body_garment);
                          return (
                            <a 
                              href={item.full_body_garment} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 transition-colors truncate"
                            >
                              {url.hostname}
                            </a>
                          );
                        } catch {
                          return <span className="truncate">{item.full_body_garment}</span>;
                        }
                      })()}
                    </p>
                  )}
                  {item.jacket && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Jacket:</span>
                      {(() => {
                        try {
                          const url = new URL(item.jacket);
                          return (
                            <a 
                              href={item.jacket} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 transition-colors truncate"
                            >
                              {url.hostname}
                            </a>
                          );
                        } catch {
                          return <span className="truncate">{item.jacket}</span>;
                        }
                      })()}
                    </p>
                  )}
                  {item.shoes && (
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Shoes:</span>
                      {(() => {
                        try {
                          const url = new URL(item.shoes);
                          return (
                            <a 
                              href={item.shoes} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-blue-600 hover:text-blue-800 transition-colors truncate"
                            >
                              {url.hostname}
                            </a>
                          );
                        } catch {
                          return <span className="truncate">{item.shoes}</span>;
                        }
                      })()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}