"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { revalidatePath } from "next/cache";
import type { TeamChatChannel } from "@/types/database";

export type TeamChatActionState = { error: string | null };

const CHANNELS: TeamChatChannel[] = ["general", "bookings", "maintenance"];

export async function sendTeamMessage(
  _prevState: TeamChatActionState,
  formData: FormData
): Promise<TeamChatActionState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in to send messages." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "Message can't be empty." };
  }
  if (body.length > 4000) {
    return { error: "Message is too long." };
  }

  const channelInput = String(formData.get("channel") ?? "general");
  const channel = CHANNELS.includes(channelInput as TeamChatChannel)
    ? (channelInput as TeamChatChannel)
    : "general";

  const supabase = await createClient();
  const { error } = await supabase.from("team_messages").insert({
    company_id: profile.company_id,
    author_id: profile.id,
    body,
    channel,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/chat");
  return { error: null };
}
