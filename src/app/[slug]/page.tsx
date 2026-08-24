import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCompanyBySlug, listPublishedVehicles } from "@/lib/queries/public";
import { Footer } from "@/components/footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  return { title: company ? `${company.name} — Ferro` : "Ferro" };
}

export default async function CompanyStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const vehicles = await listPublishedVehicles(company.id);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-line px-6 py-10 text-center md:px-10">
        <p className="font-mono text-xs uppercase tracking-widest text-amber-text">
          Ferro
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{company.name}</h1>
        <p className="mt-2 text-sm text-muted">
          {vehicles.length > 0
            ? `${vehicles.length} vehicle${vehicles.length === 1 ? "" : "s"} available`
            : "No vehicles listed yet"}
        </p>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:px-10">
        {vehicles.length === 0 ? (
          <p className="text-center text-sm text-muted">
            Check back soon — this fleet is being set up.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/${slug}/${vehicle.id}`}
                className="group overflow-hidden rounded-[14px] border border-line bg-surface transition hover:-translate-y-0.5 hover:border-amber-text"
              >
                <div className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-surface-2 to-surface">
                  {vehicle.photoUrl ? (
                    <Image
                      src={vehicle.photoUrl}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      className="h-16 w-16 text-muted opacity-40"
                    >
                      <path d="M3 13l1.8-6A2.4 2.4 0 017.1 5.5h9.8a2.4 2.4 0 012.3 1.8L21 13" />
                      <rect x="2.5" y="13" width="19" height="5" rx="2" />
                      <circle cx="7" cy="18.5" r="1.5" />
                      <circle cx="17" cy="18.5" r="1.5" />
                    </svg>
                  )}
                </div>
                <div className="px-4 py-4">
                  <div className="text-[15px] font-semibold">
                    {vehicle.year ? `${vehicle.year} ` : ""}
                    {vehicle.make} {vehicle.model}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-wide text-muted">
                      {vehicle.color ?? ""}
                    </span>
                    {vehicle.daily_rate && (
                      <span className="font-mono text-sm font-bold text-amber-text">
                        ${vehicle.daily_rate}/day
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
