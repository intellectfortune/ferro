"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isBrokerOrAbove, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { VehicleStatus } from "@/types/database";

export type VehicleActionState = { error: string | null };

function vehicleFieldsFromFormData(formData: FormData) {
  const year = formData.get("year");
  const dailyRate = formData.get("daily_rate");

  return {
    make: String(formData.get("make") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    year: year && String(year).trim() !== "" ? Number(year) : null,
    color: String(formData.get("color") ?? "").trim() || null,
    vin: String(formData.get("vin") ?? "").trim() || null,
    license_plate: String(formData.get("license_plate") ?? "").trim() || null,
    bouncie_imei: String(formData.get("bouncie_imei") ?? "").trim() || null,
    daily_rate:
      dailyRate && String(dailyRate).trim() !== "" ? Number(dailyRate) : null,
    description: String(formData.get("description") ?? "").trim() || null,
    status: (String(formData.get("status") ?? "draft") as VehicleStatus),
  };
}

export async function createVehicle(
  _prevState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { error: "You must be signed in to add vehicles." };
  }

  const fields = vehicleFieldsFromFormData(formData);
  if (!fields.make || !fields.model) {
    return { error: "Make and model are required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      ...fields,
      company_id: profile.company_id,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/vehicles");
  redirect(`/dashboard/vehicles/${data.id}`);
}

export async function updateVehicle(
  vehicleId: string,
  _prevState: VehicleActionState,
  formData: FormData
): Promise<VehicleActionState> {
  const profile = await getCurrentProfile();
  if (!profile || !isBrokerOrAbove(profile.role)) {
    return { error: "You don't have permission to edit vehicles." };
  }

  const fields = vehicleFieldsFromFormData(formData);
  if (!fields.make || !fields.model) {
    return { error: "Make and model are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("vehicles")
    .update(fields)
    .eq("id", vehicleId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/vehicles");
  revalidatePath(`/dashboard/vehicles/${vehicleId}`);
  return { error: null };
}

export async function deleteVehicle(vehicleId: string) {
  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    throw new Error("You don't have permission to delete vehicles.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", vehicleId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/vehicles");
  redirect("/dashboard/vehicles");
}
