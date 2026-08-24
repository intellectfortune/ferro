import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { listTeamMessages } from "@/lib/queries/team-chat";
import { listTeamMembers } from "@/lib/queries/team";
import { ChatFeed } from "./chat-feed";

export default async function ChatPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [messages, members] = await Promise.all([
    listTeamMessages(),
    listTeamMembers(),
  ]);

  const memberNames = Object.fromEntries(
    members.map((m) => [m.id, m.full_name ?? m.email])
  );

  return (
    <div className="flex h-[75vh] flex-col">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Team Chat</h1>
      <ChatFeed
        companyId={profile.company_id}
        currentProfileId={profile.id}
        memberNames={memberNames}
        initialMessages={messages}
      />
    </div>
  );
}
