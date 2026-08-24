"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/actions/profile";
import { bucketForCategory } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import type { PhotoCategory } from "@/types/database";

export type DocumentActionState = { error: string | null; success?: boolean };

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];
const DOC_CATEGORIES: PhotoCategory[] = ["id_doc", "dec_page", "other_doc"];

export async function uploadVehicleDocument(
  _prevState: DocumentActionState,
  formData: FormData
): Promise<DocumentActionState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in to upload documents." };
  }

  const vehicleId = String(formData.get("vehicle_id") ?? "");
  if (!vehicleId) {
    return { error: "Choose a vehicle." };
  }

  const categoryInput = String(formData.get("category") ?? "");
  if (!DOC_CATEGORIES.includes(categoryInput as PhotoCategory)) {
    return { error: "Choose a document type." };
  }
  const category = categoryInput as PhotoCategory;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a file to upload." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "File must be under 15MB." };
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, WEBP, HEIC, or PDF files are supported." };
  }

  const bucket = bucketForCategory(category);
  const ext = file.name.split(".").pop() ?? "pdf";
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
    is_public: false,
    uploaded_by: profile.id,
  });

  if (insertError) {
    await supabase.storage.from(bucket).remove([path]);
    return { error: insertError.message };
  }

  revalidatePath("/dashboard/documents");
  return { error: null, success: true };
}
