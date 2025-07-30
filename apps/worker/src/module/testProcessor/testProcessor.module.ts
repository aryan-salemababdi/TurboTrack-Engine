import { Module } from '@nestjs/common';
import { TestProcessorController } from './testProcessor.controller';
import { TestProcessorService } from './testProcessor.service';





@Module({
  controllers: [TestProcessorController],
  providers: [TestProcessorService],
})
export class TestProcessorModule {}
