import { cookies } from "next/headers";
import Link from "next/link";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Database } from "@/types/supabase";
import { AvatarIcon } from "@radix-ui/react-icons";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

import ClientSideCredits from "./realtime/ClientSideCredits";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export const dynamic = "force-dynamic";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

const packsIsEnabled = process.env.NEXT_PUBLIC_TUNE_TYPE === "packs";

export const revalidate = 0;

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: credits } = await supabase
    .from("credits")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <div className="fashion-container flex items-center justify-between py-4">
      {/* Mobile/Tablet Menu */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader className="mb-4">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4">
              <SheetClose asChild>
                <Link href="/overview">
                  <span className="block py-2 text-sm hover:text-neutral-500 transition-colors">
                    Home
                  </span>
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link href="/overview/gallery">
                  <span className="block py-2 text-sm hover:text-neutral-500 transition-colors">
                    Gallery
                  </span>
                </Link>
              </SheetClose>
              {stripeIsConfigured && (
                <SheetClose asChild>
                  <Link href="/get-credits">
                    <span className="block py-2 text-sm hover:text-neutral-500 transition-colors">
                      Get Credits
                    </span>
                  </Link>
                </SheetClose>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Center Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:translate-x-0">
        <Link href="/">
          <h2 className="text-xl font-light tracking-wider whitespace-nowrap">STYLED BY CLARA</h2>
        </Link>
      </div>

      {/* Desktop Navigation */}
      {user && (
        <nav className="hidden lg:flex items-center space-x-6">
          <Link href="/overview">
            <span className="text-sm hover:text-neutral-500 transition-colors">Home</span>
          </Link>
          <Link href="/overview/gallery">
            <span className="text-sm hover:text-neutral-500 transition-colors">Gallery</span>
          </Link>
          {stripeIsConfigured && (
            <Link href="/get-credits">
              <span className="text-sm hover:text-neutral-500 transition-colors">Get Credits</span>
            </Link>
          )}
        </nav>
      )}

      {/* Right Side - Auth & Credits */}
      <div className="flex items-center gap-6">
        {!user && (
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-light">
              Login / Signup
            </Button>
          </Link>
        )}
        {user && (
          <div className="flex items-center gap-4">
            {stripeIsConfigured && (
              <ClientSideCredits creditsRow={credits ? credits : null} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <AvatarIcon height={24} width={24} className="text-neutral-700" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-primary text-center overflow-hidden text-ellipsis">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <Button type="submit" className="w-full" variant="ghost">
                    Log out
                  </Button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
