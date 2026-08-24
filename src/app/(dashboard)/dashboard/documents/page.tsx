import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { listDocuments } from "@/lib/queries/documents";
import { listVehiclesForSelect } from "@/lib/queries/bookings";
import { UploadDocumentButton } from "./upload-document-button";
import { DeleteDocumentButton } from "./delete-document-button";

const CATEGORY_LABEL: Record<string, string> = {
  id_doc: "ID Photo",
  dec_page: "Dec Page",
  other_doc: "Other",
};

function isImagePath(path: string) {
  return /\.(jpe?g|png|webp|heic)$/i.test(path);
}

export default async function DocumentsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [documents, vehicles] = await Promise.all([
    listDocuments(),
    listVehiclesForSelect(),
  ]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <UploadDocumentButton vehicles={vehicles} />
      </div>
      {profile.role === "employee" && (
        <p className="mb-6 text-sm text-muted">
          You can see documents you&apos;ve uploaded. Owners and brokers can see
          the whole fleet&apos;s documents.
        </p>
      )}
      {profile.role !== "employee" && <div className="mb-6" />}

      {documents.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line bg-surface px-6 py-10 text-center text-sm text-muted">
          No documents yet. Upload ID photos and dec pages for your vehicles.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => {
            const vehicle = doc.vehicles as unknown as {
              make: string;
              model: string;
            } | null;
            const isImage = isImagePath(doc.storage_path);

            return (
              <div
                key={doc.id}
                className="overflow-hidden rounded-[14px] border border-line bg-surface"
              >
                <a
                  href={doc.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex h-[132px] items-center justify-center bg-gradient-to-br from-surface-2 to-surface"
                >
                  {isImage && doc.url ? (
                    <Image
                      src={doc.url}
                      alt=""
                      fill
                      sizes="33vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      className="h-12 w-12 text-muted opacity-50"
                    >
                      <path d="M5 2.5h7l3 3v12h-10z" />
                      <path d="M12 2.5v3h3" />
                    </svg>
                  )}
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-amber-soft px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide text-amber-text">
                    {CATEGORY_LABEL[doc.category] ?? doc.category}
                  </span>
                </a>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-[13.5px] font-semibold">
                      {vehicle ? `${vehicle.make} ${vehicle.model}` : ""}
                    </div>
                    <div className="text-xs text-muted">
                      {doc.uploaderName} ·{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                      }).format(new Date(doc.created_at))}
                    </div>
                  </div>
                  <DeleteDocumentButton documentId={doc.id} vehicleId={doc.vehicle_id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
