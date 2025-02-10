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
    <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between">
      {user && (
        <div className="lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/overview">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/overview/gallery">Gallery</Link>
              </DropdownMenuItem>
              {stripeIsConfigured && (
                <DropdownMenuItem asChild>
                  <Link href="/get-credits">Get Credits</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className="flex gap-2 h-full">
        <Link href="/">
          <h2 className="font-bold">Styled By Clara</h2>
        </Link>
      </div>
      {user && (
        <div className="hidden lg:flex flex-row gap-2">
          <Link href="/overview">
            <Button variant={"ghost"}>Home</Button>
          </Link>
          <Link href="/overview/gallery">
            <Button variant={"ghost"}>Gallery</Button>
          </Link>
          {stripeIsConfigured && (
            <Link href="/get-credits">
              <Button variant={"ghost"}>Get Credits</Button>
            </Link>
          )}
        </div>
      )}
      <div className="flex gap-4 lg:ml-auto">
        {!user && (
          <Link href="/login">
            <Button variant={"ghost"}>Login / Signup</Button>
          </Link>
        )}
        {user && (
          <div className="flex flex-row gap-4 text-center align-middle justify-center">
            {stripeIsConfigured && (
              <ClientSideCredits creditsRow={credits ? credits : null} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <AvatarIcon height={24} width={24} className="text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-primary text-center overflow-hidden text-ellipsis">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <Button
                    type="submit"
                    className="w-full text-left"
                    variant={"ghost"}
                  >
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
