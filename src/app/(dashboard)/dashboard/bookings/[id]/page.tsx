import { notFound, redirect } from "next/navigation";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { getBookingWithVehicle, listVehiclesForSelect } from "@/lib/queries/bookings";
import { updateBooking } from "@/lib/actions/bookings";
import { BookingForm } from "@/components/booking-form";
import { DeleteBookingButton } from "./delete-button";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{booking.customer_name}</h1>
        {canDelete && <DeleteBookingButton bookingId={booking.id} />}
      </div>
      <BookingForm
        action={updateBooking.bind(null, booking.id)}
        vehicles={vehicles}
        initialValues={booking}
        submitLabel="Save changes"
      />
    </div>
  );
}
