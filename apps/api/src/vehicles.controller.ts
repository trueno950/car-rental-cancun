import { Controller, Get } from "@nestjs/common";

import { Public } from "./auth/public.decorator";

@Controller("vehicles")
export class VehiclesController {
  @Public()
  @Get()
  listVehicles() {
    return [] as const;
  }
}
