import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { UsersService } from "./users.service";
import type { UsersRepository } from "./users.repository";

const makeRepo = (overrides: Partial<UsersRepository> = {}): UsersRepository =>
  ({
    findAll: vi.fn(),
    findById: vi.fn(),
    updateRole: vi.fn(),
    ...overrides,
  }) as unknown as UsersRepository;

const adminUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "admin@x.com",
  name: "Admin",
  role: "admin" as const,
};
const managerUser = {
  id: "22222222-2222-2222-2222-222222222222",
  email: "mgr@x.com",
  name: "Manager",
  role: "manager" as const,
};
const employeeUser = {
  id: "33333333-3333-3333-3333-333333333333",
  email: "emp@x.com",
  name: "Employee",
  role: "employee" as const,
};

describe("UsersService", () => {
  describe("findAll()", () => {
    it("returns all users from the repository", async () => {
      const users = [adminUser, managerUser, employeeUser];
      const repo = makeRepo({ findAll: vi.fn().mockResolvedValue(users) });
      const service = new UsersService(repo);

      const result = await service.findAll();

      expect(result).toEqual(users);
      expect(repo.findAll).toHaveBeenCalledOnce();
    });
  });

  describe("updateRole()", () => {
    it("admin caller can assign admin role → succeeds", async () => {
      const updated = { ...employeeUser, role: "admin" as const };
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(employeeUser),
        updateRole: vi.fn().mockResolvedValue(updated),
      });
      const service = new UsersService(repo);

      const result = await service.updateRole(
        employeeUser.id,
        "admin",
        "admin",
      );

      expect(result).toEqual(updated);
      expect(repo.updateRole).toHaveBeenCalledWith(employeeUser.id, "admin");
    });

    it("manager caller can assign manager role → succeeds", async () => {
      const updated = { ...employeeUser, role: "manager" as const };
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(employeeUser),
        updateRole: vi.fn().mockResolvedValue(updated),
      });
      const service = new UsersService(repo);

      const result = await service.updateRole(
        employeeUser.id,
        "manager",
        "manager",
      );

      expect(result).toEqual(updated);
      expect(repo.updateRole).toHaveBeenCalledWith(employeeUser.id, "manager");
    });

    it("manager caller cannot assign admin role → throws ForbiddenException", async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(employeeUser),
      });
      const service = new UsersService(repo);

      await expect(
        service.updateRole(employeeUser.id, "admin", "manager"),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.updateRole).not.toHaveBeenCalled();
    });

    it("employee caller cannot change roles at all → throws ForbiddenException", async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(managerUser),
      });
      const service = new UsersService(repo);

      await expect(
        service.updateRole(managerUser.id, "manager", "employee"),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.updateRole).not.toHaveBeenCalled();
    });

    it("user not found → throws NotFoundException", async () => {
      const repo = makeRepo({
        findById: vi.fn().mockResolvedValue(null),
      });
      const service = new UsersService(repo);

      await expect(
        service.updateRole("non-existent-id", "manager", "admin"),
      ).rejects.toThrow(NotFoundException);
      expect(repo.updateRole).not.toHaveBeenCalled();
    });
  });
});
