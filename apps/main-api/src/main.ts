import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
