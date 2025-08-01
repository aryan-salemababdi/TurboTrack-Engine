import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { RunTestDto } from '@app/shared';

@Controller('tests')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('start')
  async startTest(@Body() runTestDto: RunTestDto) {
    const jobId = await this.appService.addTestJob(runTestDto);
    return {
      message:
        'Test has been queued. Use the jobId to connect via WebSocket for results.',
      jobId,
    };
  }

  @Post('run-and-wait')
  async runAndWait(@Body() runTestDto: RunTestDto) {
    return this.appService.addTestJobAndWaitForResult(runTestDto);
  }
}
