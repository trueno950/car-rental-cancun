import { describe, expect, it, vi } from "vitest";

import type { AppConfigService } from "./config.service";
import { ConfigController } from "./config.controller";

function makeService(stripeEnabled: boolean): AppConfigService {
  return {
    getPaymentsConfig: vi.fn().mockReturnValue({ stripeEnabled }),
  } as unknown as AppConfigService;
}

describe("ConfigController", () => {
  describe("GET /config/payments", () => {
    it("returns stripeEnabled: true when service reports enabled", () => {
      const controller = new ConfigController(makeService(true));
      expect(controller.getPaymentsConfig()).toEqual({ stripeEnabled: true });
    });

    it("returns stripeEnabled: false when service reports disabled", () => {
      const controller = new ConfigController(makeService(false));
      expect(controller.getPaymentsConfig()).toEqual({ stripeEnabled: false });
    });
  });
});
