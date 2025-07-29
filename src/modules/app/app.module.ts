import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TestModule } from '../test/test.module';
import { ResourceMonitorMiddleware } from 'src/common/middleware/resource-monitor.middleware';


@Module({
  imports: [TestModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResourceMonitorMiddleware).forRoutes('*');
  }
} 
