import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { TestProcessorService } from '../testProcessor/testProcessor.service';

interface RunTestJob {
  url: string;
  requests: number;
  concurrency: number;
  method: 'GET' | 'POST';
  testType: 'batch' | 'sustained';
}

@Processor('test-queue')
export class TestProcessor {
  constructor(
    private readonly testService: TestProcessorService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  @Process('run-single-test')
  async handleRunTest(job: Job<RunTestJob>) {
    console.log(`Processing job ${job.id} with type: ${job.data.testType}`);

    let result;
    const testData = job.data;

    if (testData.testType === 'batch') {
      result = await this.testService.runBatchTest(testData);
    } else {
      result = await this.testService.runSustainedTest(testData);
    }

    console.log(`Job ${job.id} completed.`);
    
    const resultChannel = `test_result:${job.id}`;
    await this.redisClient.publish(resultChannel, JSON.stringify(result));

    return result;
  }
}