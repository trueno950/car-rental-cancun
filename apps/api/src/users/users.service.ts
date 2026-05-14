import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { ApiUser, UserRole } from "@rental/validations";

import { UsersRepository } from "./users.repository";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<ApiUser[]> {
    this.logger.log("Listing all users");
    return this.usersRepository.findAll();
  }

  async updateRole(
    id: string,
    targetRole: UserRole,
    callerRole: UserRole,
  ): Promise<ApiUser> {
    // Defense-in-depth: only admin can assign the admin role.
    // The RolesGuard already blocks employees at the HTTP level; this
    // adds a second check so even a manager cannot escalate to admin.
    if (callerRole !== "admin" && callerRole !== "manager") {
      throw new ForbiddenException("Only managers and admins can change roles");
    }

    if (targetRole === "admin" && callerRole !== "admin") {
      throw new ForbiddenException("Only admins can assign the admin role");
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    this.logger.log(`Updating role of user ${id} to ${targetRole}`);
    return this.usersRepository.updateRole(id, targetRole);
  }
}
