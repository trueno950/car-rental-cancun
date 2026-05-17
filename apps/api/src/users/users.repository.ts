import { Inject, Injectable } from "@nestjs/common";
import { UserRoleSchema } from "@rental/validations";
import type { ApiUser } from "@rental/validations";
import { eq } from "drizzle-orm";

import { DatabaseService } from "../database/database.service";
import { usersTable } from "../database/schema/users";

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DatabaseService)
    private readonly databaseService: DatabaseService,
  ) {}

  async findAll(): Promise<ApiUser[]> {
    const rows = await this.databaseService.db.select().from(usersTable);
    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: string): Promise<ApiUser | null> {
    const rows = await this.databaseService.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return rows[0] ? this.toDomain(rows[0]) : null;
  }

  async updateRole(id: string, role: ApiUser["role"]): Promise<ApiUser> {
    const rows = await this.databaseService.db
      .update(usersTable)
      .set({ role, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    // Caller guarantees the row exists (checked via findById before updateRole)
    return this.toDomain(rows[0]!);
  }

  async setFrequent(userId: string, value: boolean): Promise<ApiUser> {
    const rows = await this.databaseService.db
      .update(usersTable)
      .set({ isFrequent: value, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();
    return this.toDomain(rows[0]!);
  }

  private toDomain(row: typeof usersTable.$inferSelect): ApiUser {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: UserRoleSchema.parse(row.role),
      isFrequent: row.isFrequent,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
