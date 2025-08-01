import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RunTestDto } from '@app/shared';
import { TestProcessorService } from '../testProcessor/testProcessor.service';

@Processor('test-queue')
export class TestProcessor {
  constructor(
    private readonly testService: TestProcessorService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  @Process('run-single-test')
  async handleRunTest(job: Job<RunTestDto>) {
    console.log(`Processing job ${job.id} with type: ${job.data.testType}`);

    let result;
    if (job.data.testType === 'batch') {
      result = await this.testService.runBatchTest(
        job.data,
        job,
        this.redisClient,
      );
    } else {
      result = await this.testService.runSustainedTest(
        job.data,
        job,
        this.redisClient,
      );
    }

    console.log(`Job ${job.id} completed.`);
    
    const resultChannel = `test_result:${job.id}`;
    await this.redisClient.publish(resultChannel, JSON.stringify(result));

    return result;
  }
}