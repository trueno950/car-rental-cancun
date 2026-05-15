import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import type { UsersService } from "./users.service";
import { UsersController } from "./users.controller";

const admin = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  email: "admin@x.com",
  name: "Admin",
  role: "admin" as const,
  isFrequent: false,
};

const manager = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  email: "mgr@x.com",
  name: "Manager",
  role: "manager" as const,
  isFrequent: false,
};

function makeService(overrides: Partial<UsersService> = {}): UsersService {
  return {
    findAll: vi.fn().mockResolvedValue([]),
    updateRole: vi.fn().mockResolvedValue(admin),
    setFrequent: vi.fn().mockResolvedValue({ ...admin, isFrequent: true }),
    ...overrides,
  } as unknown as UsersService;
}

describe("UsersController", () => {
  describe("PATCH /users/:id/frequent", () => {
    it("delegates to service.setFrequent with actorRole and value", async () => {
      const service = makeService();
      const controller = new UsersController(service);
      const targetId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

      const result = await controller.setFrequent(
        targetId,
        { isFrequent: true },
        { user: admin } as never,
      );

      expect(service.setFrequent).toHaveBeenCalledWith("admin", targetId, true);
      expect(result).toMatchObject({ isFrequent: true });
    });

    it("works when called by manager role", async () => {
      const service = makeService();
      const controller = new UsersController(service);
      const targetId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

      await controller.setFrequent(targetId, { isFrequent: false }, {
        user: manager,
      } as never);

      expect(service.setFrequent).toHaveBeenCalledWith(
        "manager",
        targetId,
        false,
      );
    });

    it("propagates ForbiddenException from service", async () => {
      const service = makeService({
        setFrequent: vi.fn().mockRejectedValue(new ForbiddenException()),
      });
      const controller = new UsersController(service);

      await expect(
        controller.setFrequent(
          "cccccccc-cccc-cccc-cccc-cccccccccccc",
          { isFrequent: true },
          { user: admin } as never,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("propagates NotFoundException from service", async () => {
      const service = makeService({
        setFrequent: vi.fn().mockRejectedValue(new NotFoundException()),
      });
      const controller = new UsersController(service);

      await expect(
        controller.setFrequent(
          "cccccccc-cccc-cccc-cccc-cccccccccccc",
          { isFrequent: true },
          { user: admin } as never,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
