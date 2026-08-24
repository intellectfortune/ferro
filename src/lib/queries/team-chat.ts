import { createClient } from "@/lib/supabase/server";
import type { TeamChatChannel } from "@/types/database";

export type TeamMessage = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  channel: TeamChatChannel;
};

export async function listTeamMessages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_messages")
    .select("id, body, created_at, author_id, channel")
    .order("created_at", { ascending: true })
    .limit(500);

  return data ?? [];
}
