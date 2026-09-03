import { notFound, redirect } from "next/navigation";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { getBookingWithVehicle, listVehiclesForSelect } from "@/lib/queries/bookings";
import { updateBooking } from "@/lib/actions/bookings";
import { BookingForm } from "@/components/booking-form";
import { DeleteBookingButton } from "./delete-button";
import { QuickInvoicePrompt } from "./quick-invoice-prompt";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { id } = await params;
  const { new: isNew } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const [booking, vehicles] = await Promise.all([
    getBookingWithVehicle(id),
    listVehiclesForSelect(),
  ]);

  if (!booking) notFound();

  // Fleet Manager+ can delete any booking; Broker can only delete one it
  // created itself; Employee can't delete bookings at all.
  const canDelete =
    isFleetManagerOrAbove(profile.role) ||
    (profile.role === "broker" && booking.created_by === profile.id);

  // Billing is Fleet Manager+ only, and createInvoiceForBooking requires a
  // customer email on file — matches the same gate NewInvoiceButton shows.
  const showInvoicePrompt =
    isNew === "1" && isFleetManagerOrAbove(profile.role) && Boolean(booking.customer_email);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{booking.customer_name}</h1>
        {canDelete && <DeleteBookingButton bookingId={booking.id} />}
      </div>
      {showInvoicePrompt && (
        <div className="mt-6">
          <QuickInvoicePrompt bookingId={booking.id} totalPrice={booking.total_price} />
        </div>
      )}
      <BookingForm
        action={updateBooking.bind(null, booking.id)}
        vehicles={vehicles}
        initialValues={booking}
        submitLabel="Save changes"
      />
    </div>
  );
}
