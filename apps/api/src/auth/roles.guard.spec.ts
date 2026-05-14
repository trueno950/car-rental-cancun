import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";

import { RolesGuard } from "./roles.guard";

function makeCtx(user: { role: string } | undefined): ExecutionContext {
  return {
    getHandler: () => () => {},
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe("RolesGuard", () => {
  it("returns true when no @Roles metadata is set (open route)", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx(undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("returns true when @Roles is empty array", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "customer" });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows employee when @Roles includes employee", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([
      "employee",
      "manager",
      "admin",
    ]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "employee" });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows manager when @Roles includes manager", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([
      "manager",
      "admin",
    ]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "manager" });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows admin when @Roles includes admin", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([
      "manager",
      "admin",
    ]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "admin" });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows admin through a booking-management route", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([
      "employee",
      "manager",
      "admin",
    ]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "admin" });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("throws ForbiddenException when employee hits @Roles('manager','admin')", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([
      "manager",
      "admin",
    ]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "employee" });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when customer hits @Roles('employee','manager','admin')", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([
      "employee",
      "manager",
      "admin",
    ]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "customer" });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when manager hits admin-only route", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue(["admin"]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx({ role: "manager" });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("throws ForbiddenException when user is absent and @Roles is set", () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, "getAllAndOverride").mockReturnValue([
      "employee",
      "manager",
      "admin",
    ]);
    const guard = new RolesGuard(reflector);
    const ctx = makeCtx(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
