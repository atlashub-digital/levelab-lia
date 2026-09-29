import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const port = Number(process.env.PORT ?? 8095);

  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
  }

  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(port, "0.0.0.0");

  console.log(
    JSON.stringify({
      event: "lia.started",
      service: "LIA Core",
      version: "0.2.1",
      port,
      nodeEnv: process.env.NODE_ENV ?? "unknown",
    }),
  );
}

bootstrap().catch((error: unknown) => {
  console.error("LIA bootstrap failed", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  process.exit(1);
});
