import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import type { UpdateVehicleDto } from "@rental/validations";

import {
  VehicleForm,
  getVehicleByIdAction,
  updateVehicleAction,
} from "@features/vehicles";

type EditVehiclePageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function EditVehiclePage({ params }: EditVehiclePageProps) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "VehicleAdminPage" });

  const vehicle = await getVehicleByIdAction(id);

  if (!vehicle) {
    redirect(`/${locale}/admin/vehicles`);
  }

  async function handleUpdate(input: UpdateVehicleDto) {
    "use server";
    return updateVehicleAction(id, input);
  }

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <VehicleForm
          mode="edit"
          initialValues={vehicle}
          onSubmit={handleUpdate}
        />
      </div>
    </main>
  );
}
