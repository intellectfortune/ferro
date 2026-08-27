import { NextResponse } from "next/server";
import { getCurrentProfile, isFleetManagerOrAbove } from "@/lib/actions/profile";
import { listInvoices } from "@/lib/queries/invoices";
import { checkRateLimit } from "@/lib/rate-limit";

function csvField(value: string | number | null | undefined) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !isFleetManagerOrAbove(profile.role)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const rl = await checkRateLimit("general", profile.id);
  if (!rl.ok) return NextResponse.json({ error: rl.error }, { status: 429 });

  const invoices = await listInvoices();

  const header = [
    "Date",
    "Customer",
    "Vehicle",
    "Amount",
    "Status",
    "Due date",
    "Invoice URL",
  ];

  const rows = invoices.map((invoice) => {
    const booking = invoice.bookings as unknown as {
      customer_name: string;
      vehicles: { make: string; model: string } | null;
    } | null;

    return [
      new Date(invoice.created_at).toISOString().slice(0, 10),
      booking?.customer_name ?? "",
      booking?.vehicles ? `${booking.vehicles.make} ${booking.vehicles.model}` : "",
      invoice.amount,
      invoice.status,
      invoice.due_date ? new Date(invoice.due_date).toISOString().slice(0, 10) : "",
      invoice.hosted_invoice_url ?? "",
    ]
      .map(csvField)
      .join(",");
  });

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ferro-invoices-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
