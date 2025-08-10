import { Module } from '@nestjs/common';
import { TestProcessorService } from './testProcessor.service';

@Module({
  providers: [TestProcessorService],
})
export class TestProcessorModule {}
