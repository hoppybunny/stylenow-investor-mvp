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
    <div className="p-4">
      <AlertDialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
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
        <Card className="w-full">
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No images to display</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden relative">
              <button
                onClick={() => setItemToDelete(item.id)}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white/90 transition-colors"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
              <CardContent className="p-4">
                <img
                  src={item.imageUrl}
                  alt="Generated outfit"
                  className="w-full h-48 object-cover mb-4 cursor-pointer"
                  onClick={() => window.open(item.imageUrl, '_blank')}
                />
                <div className="space-y-2">
                  {item.top_garment && (
                    <p>Top: {
                      (() => {
                        try {
                          const url = new URL(item.top_garment);
                          return <a href={item.top_garment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url.hostname}</a>;
                        } catch {
                          return <span>{item.top_garment.length > 50 ? `${item.top_garment.substring(0, 50)}...` : item.top_garment}</span>;
                        }
                      })()
                    }</p>
                  )}
                  {item.bottom_garment && (
                    <p>Bottom: {
                      (() => {
                        try {
                          const url = new URL(item.bottom_garment);
                          return <a href={item.bottom_garment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url.hostname}</a>;
                        } catch {
                          return <span>{item.bottom_garment.length > 50 ? `${item.bottom_garment.substring(0, 50)}...` : item.bottom_garment}</span>;
                        }
                      })()
                    }</p>
                  )}
                  {item.full_body_garment && (
                    <p>Full Body: {
                      (() => {
                        try {
                          const url = new URL(item.full_body_garment);
                          return <a href={item.full_body_garment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url.hostname}</a>;
                        } catch {
                          return <span>{item.full_body_garment.length > 50 ? `${item.full_body_garment.substring(0, 50)}...` : item.full_body_garment}</span>;
                        }
                      })()
                    }</p>
                  )}
                  {item.jacket && (
                    <p>Jacket: {
                      (() => {
                        try {
                          const url = new URL(item.jacket);
                          return <a href={item.jacket} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url.hostname}</a>;
                        } catch {
                          return <span>{item.jacket.length > 50 ? `${item.jacket.substring(0, 50)}...` : item.jacket}</span>;
                        }
                      })()
                    }</p>
                  )}
                  {item.shoes && (
                    <p>Shoes: {
                      (() => {
                        try {
                          const url = new URL(item.shoes);
                          return <a href={item.shoes} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{url.hostname}</a>;
                        } catch {
                          return <span>{item.shoes.length > 50 ? `${item.shoes.substring(0, 50)}...` : item.shoes}</span>;
                        }
                      })()
                    }</p>
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