import type { PhotoCategory } from "@/types/database";

export function bucketForCategory(category: PhotoCategory) {
  return category === "listing_photo" ? "vehicle-photos" : "vehicle-docs";
}
