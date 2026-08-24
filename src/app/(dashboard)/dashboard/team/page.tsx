import { redirect } from "next/navigation";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { listTeamMembers } from "@/lib/queries/team";
import { InviteButton } from "./invite-button";
import { MemberRow } from "./member-row";

export default async function TeamPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const members = await listTeamMembers();
  const canManage = canManageVehicles(profile.role);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        {canManage && <InviteButton />}
      </div>

      <div className="overflow-hidden rounded-[14px] border border-line bg-surface">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            id={member.id}
            fullName={member.full_name}
            email={member.email}
            role={member.role}
            isSelf={member.id === profile.id}
            canManage={canManage}
          />
        ))}
      </div>
    </div>
  );
}
