import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getCompanyBySlug,
  getPublishedVehicle,
} from "@/lib/queries/public";
import { ContactForm } from "./contact-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; vehicleId: string }>;
}): Promise<Metadata> {
  const { slug, vehicleId } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) return { title: { absolute: "Ferro" } };
  const vehicle = await getPublishedVehicle(company.id, vehicleId);
  if (!vehicle) return { title: { absolute: company.name } };

  const label = `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.make} ${vehicle.model}`;
  return {
    title: { absolute: `${label} — ${company.name}` },
    description:
      vehicle.description ??
      `${label} available to rent from ${company.name}${vehicle.daily_rate ? ` — $${vehicle.daily_rate}/day` : ""}.`,
  };
}

const SPEC_LABEL: Record<string, string> = {
  horsepower: "Horsepower",
  top_speed_mph: "Top speed",
  seats: "Seats",
  transmission: "Transmission",
};

export default async function VehicleStorefrontPage({
  params,
}: {
  params: Promise<{ slug: string; vehicleId: string }>;
}) {
  const { slug, vehicleId } = await params;
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  const vehicle = await getPublishedVehicle(company.id, vehicleId);
  if (!vehicle) notFound();

  const specs = (vehicle.specs ?? {}) as Record<string, unknown>;

  return (
    <main className="min-h-screen">
      <header className="border-b border-line px-6 py-6 md:px-10">
        <Link
          href={`/${slug}`}
          className="font-mono text-xs uppercase tracking-widest text-amber-text hover:underline"
        >
          ← {company.name}
        </Link>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {vehicle.year ? `${vehicle.year} ` : ""}
          {vehicle.make} {vehicle.model}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          {vehicle.color && (
            <span className="font-mono text-sm text-muted">{vehicle.color}</span>
          )}
          {vehicle.daily_rate && (
            <span className="font-mono text-sm font-bold text-amber-text">
              ${vehicle.daily_rate}/day
            </span>
          )}
        </div>

        {vehicle.photoUrls.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {vehicle.photoUrls.map((url, i) => (
              <div
                key={url}
                className={`relative aspect-video overflow-hidden rounded-[14px] border border-line ${
                  i === 0 ? "sm:col-span-2 sm:aspect-[2/1]" : ""
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        )}

        {Object.keys(specs).length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4 rounded-[14px] border border-line bg-surface p-5 sm:grid-cols-4">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key}>
                <div className="font-mono text-[11px] uppercase tracking-wide text-muted">
                  {SPEC_LABEL[key] ?? key}
                </div>
                <div className="mt-1 text-lg font-semibold">{String(value)}</div>
              </div>
            ))}
          </div>
        )}

        {vehicle.description && (
          <p className="mt-10 max-w-2xl text-[15px] leading-relaxed text-paper/90">
            {vehicle.description}
          </p>
        )}

        <div className="mt-10 max-w-2xl">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
            Interested? Get in touch
          </h2>
          <ContactForm
            companyId={company.id}
            vehicleId={vehicle.id}
            vehicleLabel={`${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.make} ${vehicle.model}`}
          />
        </div>
      </div>
    </main>
  );
}
