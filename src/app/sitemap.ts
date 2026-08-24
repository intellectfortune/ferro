import type { MetadataRoute } from "next";
import { listAllStorefrontsForSitemap } from "@/lib/queries/public";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const marketingPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/waitlist`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const storefronts = await listAllStorefrontsForSitemap();

  const storefrontPages: MetadataRoute.Sitemap = storefronts.flatMap((company) => [
    {
      url: `${siteUrl}/${company.slug}`,
      lastModified: company.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    ...company.vehicles.map((vehicle) => ({
      url: `${siteUrl}/${company.slug}/${vehicle.id}`,
      lastModified: vehicle.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ]);

  return [...marketingPages, ...storefrontPages];
}
