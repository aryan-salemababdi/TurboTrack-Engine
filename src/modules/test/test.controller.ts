import { Controller, Post, Body } from '@nestjs/common';
import { TestService } from './test.service';
import { RunTestType } from 'src/common/types/runTest.type';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post('run-test')
  async runTest(
    @Body() body: RunTestType & { testType: 'batch' | 'sustained' },
  ) {
    if (body.testType === 'batch') {
      return this.testService.runBatchTest(body);
    } else {
      return this.testService.runSustainedTest(body);
    }
  }
}
