import { Controller, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { RunTestDto } from '@app/shared';
import { EventsGateway } from '../events/events.gateway';

@Controller('tests')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventsGateway: EventsGateway,
  ) {}

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

  @Post('webhook/result')
  async handleN8nResult(@Body() fullResult: any) {
    const { jobId, ...resultData } = fullResult;
    if (!fullResult || typeof fullResult !== 'object') {
      console.error('Invalid result received from n8n:', fullResult);
      return;
    }
    else if (!jobId) {
      return { status: 'error', message: 'jobId is missing from n8n callback' };
    }
    
    console.log(`Received result for job ${jobId} from n8n:`, resultData);
    this.eventsGateway.sendFinalResult(jobId, resultData);

    return { status: 'ok' };
  }
}
