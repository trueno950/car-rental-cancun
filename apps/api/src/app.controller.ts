import { Controller, Get, Req } from "@nestjs/common";

import type { ApiUser } from "@rental/validations";

import { AppService } from "./app.service";
import { Public } from "./auth/public.decorator";

interface AuthenticatedRequest {
  user: ApiUser;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get("health")
  getHealth() {
    return this.appService.getStatus();
  }

  @Get("profile")
  getProfile(@Req() request: AuthenticatedRequest) {
    return request.user;
  }
}
