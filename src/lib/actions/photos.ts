"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isBrokerOrAbove } from "@/lib/actions/profile";
import { bucketForCategory } from "@/lib/storage";
import { validateUploadedFile } from "@/lib/file-validation";
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
  if (!profile || !isBrokerOrAbove(profile.role)) {
    return { error: "You don't have permission to upload photos." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a photo to upload." };
  }

  const validation = await validateUploadedFile(file, ALLOWED_TYPES, MAX_FILE_BYTES);
  if (!validation.ok) {
    return { error: validation.error };
  }

  const category: PhotoCategory = "listing_photo";
  const bucket = bucketForCategory(category);
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${profile.company_id}/${vehicleId}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: validation.realType });

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
    isBrokerOrAbove(profile.role) || photo.uploaded_by === profile.id;
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
