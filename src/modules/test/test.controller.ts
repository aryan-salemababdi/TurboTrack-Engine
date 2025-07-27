import { Controller, Post, Body } from '@nestjs/common';
import { TestService } from './test.service';

@Controller('tests')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post()
  async runTest(
    @Body()
    body: {
      url: string;
      requests: number;
      concurrency: number;
      method: 'GET' | 'POST';
    },
  ) {
    return await this.testService.runTest(body);
  }
}
