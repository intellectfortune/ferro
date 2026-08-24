import { createClient } from "@/lib/supabase/server";

export async function countDocuments() {
  const supabase = await createClient();
  const { count } = await supabase
    .from("vehicle_photos")
    .select("id", { count: "exact", head: true })
    .neq("category", "listing_photo");

  return count ?? 0;
}

export async function countDocumentsAddedThisWeek() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const supabase = await createClient();
  const { count } = await supabase
    .from("vehicle_photos")
    .select("id", { count: "exact", head: true })
    .neq("category", "listing_photo")
    .gte("created_at", weekAgo);

  return count ?? 0;
}

export async function listDocuments() {
  const supabase = await createClient();

  const { data: docs } = await supabase
    .from("vehicle_photos")
    .select(
      "id, vehicle_id, category, storage_path, uploaded_by, created_at, vehicles(make, model)"
    )
    .neq("category", "listing_photo")
    .order("created_at", { ascending: false });

  if (!docs || docs.length === 0) return [];

  const uploaderIds = [...new Set(docs.map((d) => d.uploaded_by))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", uploaderIds);
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const { data: signedUrls } = await supabase.storage
    .from("vehicle-docs")
    .createSignedUrls(
      docs.map((d) => d.storage_path),
      60 * 60
    );
  const urlByPath = new Map((signedUrls ?? []).map((s) => [s.path, s.signedUrl]));

  return docs.map((doc) => {
    const uploader = profileById.get(doc.uploaded_by);
    return {
      ...doc,
      url: urlByPath.get(doc.storage_path) ?? null,
      uploaderName: uploader?.full_name ?? uploader?.email ?? "Unknown",
    };
  });
}
