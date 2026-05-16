import { getTranslations } from "next-intl/server";

import { UserAdminTable, listUsersAction } from "@features/users";

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({
  params,
}: AdminUsersPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "UserAdminPage" });

  const users = await listUsersAction();

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </header>

        <UserAdminTable
          users={users}
          copy={{
            empty: t("emptyState"),
            colName: t("table.columns.name"),
            colEmail: t("table.columns.email"),
            colRole: t("table.columns.role"),
            colFrequent: t("table.columns.frequent"),
            colActions: t("table.columns.actions"),
            roleLabels: {
              customer: t("roles.customer"),
              employee: t("roles.employee"),
              manager: t("roles.manager"),
              admin: t("roles.admin"),
            },
            markFrequent: t("actions.markFrequent"),
            removeFrequent: t("actions.removeFrequent"),
          }}
        />
      </div>
    </main>
  );
}
