import { createBooking } from "@/lib/actions/bookings";
import { listVehiclesForSelect } from "@/lib/queries/bookings";
import { BookingForm } from "@/components/booking-form";

export default async function NewBookingPage() {
  const vehicles = await listVehiclesForSelect();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">New booking</h1>
      {vehicles.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Add a vehicle first before creating a booking.
        </p>
      ) : (
        <BookingForm action={createBooking} vehicles={vehicles} submitLabel="Create booking" />
      )}
    </div>
  );
}
