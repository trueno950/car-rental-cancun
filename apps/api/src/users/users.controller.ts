import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UpdateUserRoleSchema } from "@rental/validations";
import type { ApiUser, UpdateUserRole } from "@rental/validations";

import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { UsersService } from "./users.service";

interface AuthenticatedRequest {
  user: ApiUser;
}

@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles("employee", "manager", "admin")
  async list(): Promise<ApiUser[]> {
    this.logger.log("GET /users");
    return this.usersService.findAll();
  }

  @Patch(":id/role")
  @Roles("manager", "admin")
  async updateRole(
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(UpdateUserRoleSchema)) body: UpdateUserRole,
    @Req() request: AuthenticatedRequest,
  ): Promise<ApiUser> {
    this.logger.log(`PATCH /users/${id}/role → ${body.role}`);
    return this.usersService.updateRole(id, body.role, request.user.role);
  }
}
