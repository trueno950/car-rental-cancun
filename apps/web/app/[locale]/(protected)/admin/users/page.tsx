import { getTranslations } from "next-intl/server";

import { Pagination } from "@shared/components/ui";
import { UserAdminTable, listUsersAction } from "@features/users";

const PAGE_SIZE = 20;

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminUsersPage({
  params,
  searchParams,
}: AdminUsersPageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const t = await getTranslations({ locale, namespace: "UserAdminPage" });
  const tPag = await getTranslations({ locale, namespace: "Pagination" });

  const users = await listUsersAction();

  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const totalPages = Math.ceil(users.length / PAGE_SIZE);
  const paged = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          users={paged}
          copy={{
            empty: t("emptyState"),
            colName: t("table.columns.name"),
            colEmail: t("table.columns.email"),
            colCreatedAt: t("table.columns.createdAt"),
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

        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(p) => `/${locale}/admin/users?page=${p}`}
          labels={{ previous: tPag("previous"), next: tPag("next") }}
        />
      </div>
    </main>
  );
}
