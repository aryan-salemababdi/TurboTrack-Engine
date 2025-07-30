import { Controller, Post, Body } from '@nestjs/common';
import { TestProcessorService } from './testProcessor.service';
import { RunTestType } from '../../common/types/runTest.type';

@Controller('tests')
export class TestProcessorController {
  constructor(private readonly testProcessorService: TestProcessorService) {}

  @Post('run-test')
  async runTest(
    @Body() body: RunTestType & { testType: 'batch' | 'sustained' },
  ) {
    if (body.testType === 'batch') {
      return this.testProcessorService.runBatchTest(body);
    } else {
      return this.testProcessorService.runSustainedTest(body);
    }
  }
}
