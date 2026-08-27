import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/actions/profile";
import { ensureCompanyProvisioned } from "@/lib/actions/provision";
import { hasPendingJoinRequest } from "@/lib/actions/join";
import { signOut } from "@/lib/actions/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { MobileMenuButton } from "@/components/mobile-menu-button";
import { Footer } from "@/components/footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profileQuery = () =>
    supabase
      .from("profiles")
      .select("full_name, role, company_id, companies(name)")
      .eq("id", user.id)
      .single();

  let { data: profile } = await profileQuery();

  // Only a brand-new owner's very first dashboard visit hits this path —
  // provisioning their company on demand — so it's fine to pay for a
  // second profile fetch here specifically, rather than doing an
  // existence check (and its own separate auth.getUser() call) on every
  // single page load for everyone.
  if (!profile) {
    await ensureCompanyProvisioned(user);
    ({ data: profile } = await profileQuery());
  }

  if (!profile) {
    if (await hasPendingJoinRequest(user.id)) {
      redirect("/join/pending");
    }
    redirect("/signup");
  }

  const [{ count: vehicleCount }, { count: newInquiryCount }] = await Promise.all([
    supabase.from("vehicles").select("id", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const companyName = (profile.companies as unknown as { name: string } | null)
    ?.name;
  const initials = (profile.full_name ?? profile.role)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      <SidebarNav vehicleCount={vehicleCount ?? 0} newInquiryCount={newInquiryCount ?? 0} />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-ink px-4 py-4 sm:px-6 sm:py-6 md:px-10 md:static md:border-b-0">
          <div className="flex min-w-0 items-center gap-3">
            <MobileMenuButton />
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                {companyName}
              </h1>
              <div className="mt-1 flex items-center gap-2 text-[13px] text-muted">
                <span className="font-mono uppercase tracking-wide rounded-full bg-amber-soft px-2 py-0.5 text-[10.5px] font-bold text-amber-text">
                  {profile.role.replace("_", " ")}
                </span>
                {profile.full_name && (
                  <span className="hidden truncate sm:inline">{profile.full_name}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2.5 sm:gap-3">
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-[9px] border border-line px-2.5 py-1.5 text-xs text-paper/80 transition hover:border-amber-text hover:text-amber-text sm:px-3 sm:text-sm"
              >
                Sign out
              </button>
            </form>
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-amber font-mono text-[12px] font-bold text-on-amber sm:h-[38px] sm:w-[38px] sm:text-[13px]">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 pb-16 pt-6 md:px-10 md:pt-10">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
