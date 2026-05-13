import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getStatus() {
    return {
      app: "api",
      status: "ok",
    } as const;
  }
}
