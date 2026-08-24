"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, canManageVehicles } from "@/lib/actions/profile";
import { bucketForCategory } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import type { PhotoCategory } from "@/types/database";

export type PhotoActionState = { error: string | null; success?: boolean };

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export async function uploadVehiclePhoto(
  vehicleId: string,
  _prevState: PhotoActionState,
  formData: FormData
): Promise<PhotoActionState> {
  const profile = await getCurrentProfile();
  if (!profile || !canManageVehicles(profile.role)) {
    return { error: "You don't have permission to upload photos." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a photo to upload." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "Photo must be under 10MB." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, WEBP, or HEIC photos are supported." };
  }

  const category: PhotoCategory = "listing_photo";
  const bucket = bucketForCategory(category);
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${profile.company_id}/${vehicleId}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: insertError } = await supabase.from("vehicle_photos").insert({
    company_id: profile.company_id,
    vehicle_id: vehicleId,
    category,
    storage_path: path,
    is_public: true,
    uploaded_by: profile.id,
  });

  if (insertError) {
    await supabase.storage.from(bucket).remove([path]);
    return { error: insertError.message };
  }

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  return { error: null, success: true };
}

export async function deleteVehiclePhoto(photoId: string, vehicleId: string) {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("Not authenticated.");
  }

  const supabase = await createClient();

  const { data: photo, error: fetchError } = await supabase
    .from("vehicle_photos")
    .select("storage_path, category, uploaded_by")
    .eq("id", photoId)
    .single();

  if (fetchError || !photo) {
    throw new Error(fetchError?.message ?? "Photo not found.");
  }

  const canDelete =
    canManageVehicles(profile.role) || photo.uploaded_by === profile.id;
  if (!canDelete) {
    throw new Error("You don't have permission to delete this photo.");
  }

  const { error: deleteRowError } = await supabase
    .from("vehicle_photos")
    .delete()
    .eq("id", photoId);

  if (deleteRowError) {
    throw new Error(deleteRowError.message);
  }

  await supabase.storage
    .from(bucketForCategory(photo.category))
    .remove([photo.storage_path]);

  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  revalidatePath("/dashboard/documents");
}
