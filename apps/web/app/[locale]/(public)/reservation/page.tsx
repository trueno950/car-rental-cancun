import { redirect } from "next/navigation";

type ReservationPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReservationPage({
  params,
}: ReservationPageProps) {
  const { locale } = await params;
  redirect(`/${locale}/bookings/new`);
}
