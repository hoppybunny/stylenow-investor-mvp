import { cookies } from "next/headers";

import ClientSideModelsList from "@/components/realtime/ClientSideModelsList";
import { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const dynamic = "force-dynamic";

export default async function Index() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // if (!user) {
  //   return <div>User not found</div>;
  // }

  const { data: models } = await supabase
    .from("models")
    .select(
      `*, samples (
      *
    )`
    )
    .eq("user_id", user?.id || "");
  // .eq("user_id", user.id);

  return (
    <div className="fashion-container">
      <div className="max-w-[800px] mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-light mb-2">Virtual Dress Room</h1>
          <p className="text-neutral-600">Try on clothes and create your perfect look</p>
        </div>
        <ClientSideModelsList />
      </div>
    </div>
  );
}
