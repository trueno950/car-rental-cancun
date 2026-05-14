import "reflect-metadata";
import { config } from "dotenv";

config();

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { ResponseEnvelopeInterceptor } from "./common/interceptors/response-envelope.interceptor";
import { getApiEnv } from "./config/env";

async function bootstrap() {
  const env = getApiEnv();
  const app = await NestFactory.create(AppModule);

  // Order matters:
  // - LoggingInterceptor runs first (outermost): captures total request time.
  // - ResponseEnvelopeInterceptor runs after: wraps the eventual payload.
  // - AllExceptionsFilter is the last word on errors.
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseEnvelopeInterceptor(),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(env.PORT);
}

void bootstrap();
