import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './module/worker/worker.module';


async function bootstrap() {
  const app = await NestFactory.create(WorkerModule);
  await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
