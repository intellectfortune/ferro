import { redirect } from "next/navigation";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { listTeamMembers, getCompanyJoinCode, listPendingJoinRequests } from "@/lib/queries/team";
import { InviteButton } from "./invite-button";
import { MemberRow } from "./member-row";
import { JoinCodeCard } from "./join-code-card";
import { JoinRequestRow } from "./join-request-row";

export default async function TeamPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const canManage = isFleetManagerOrAbove(profile.role);

  const [members, joinCode, pendingRequests] = await Promise.all([
    listTeamMembers(),
    canManage ? getCompanyJoinCode(profile.company_id) : Promise.resolve(null),
    canManage ? listPendingJoinRequests() : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Team</h1>
        {canManage && <InviteButton />}
      </div>

      {canManage && <JoinCodeCard initialCode={joinCode} />}

      {canManage && pendingRequests.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-[14px] border border-amber-text/30 bg-surface">
          <h2 className="border-b border-line px-5 py-3 text-sm font-semibold text-amber-text">
            Pending requests
          </h2>
          {pendingRequests.map((request) => (
            <JoinRequestRow
              key={request.id}
              id={request.id}
              email={request.email}
              fullName={request.full_name}
              requestedAt={request.requested_at}
            />
          ))}
        </div>
      )}

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
