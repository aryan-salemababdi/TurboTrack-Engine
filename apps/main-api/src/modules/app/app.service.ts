import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Redis } from 'ioredis';
import { RunTestDto } from './dto/run-test.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectQueue('test-queue') private readonly testQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async addTestJobAndWaitForResult(runTestDto: RunTestDto): Promise<any> {
    const job = await this.testQueue.add('run-single-test', runTestDto);
    const jobId = job.id;
    const resultChannel = `test_result:${jobId}`;
    const subscriber = this.redisClient.duplicate();
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        subscriber.unsubscribe(resultChannel);
        subscriber.quit();
        reject(new Error('Test timed out after 5 minutes.'));
      }, 300000); 

      subscriber.on('message', (channel, message) => {
        if (channel === resultChannel) {
          clearTimeout(timeout);
          subscriber.unsubscribe(resultChannel);
          subscriber.quit();
          resolve(JSON.parse(message));
        }
      });
      await subscriber.subscribe(resultChannel);
      console.log(`Main-API is waiting for result on channel: ${resultChannel}`);
    });
  }
}