import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Redis } from 'ioredis';
import { RunTestDto } from '@app/shared';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class AppService implements OnModuleInit {
  private redisSubscriber: Redis;

  constructor(
    @InjectQueue('test-queue') private readonly testQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly eventsGateway: EventsGateway,
  ) {
    this.redisSubscriber = this.redisClient.duplicate();
  }

  async onModuleInit() {
    await this.redisSubscriber.psubscribe('progress:*');
    await this.redisSubscriber.psubscribe('test_result:*');

    this.redisSubscriber.on('pmessage', (pattern, channel, message) => {
      const jobId = channel.split(':')[1];
      const data = JSON.parse(message);

      if (channel.startsWith('progress:')) {
        this.eventsGateway.sendProgressUpdate(jobId, data);
      } else if (channel.startsWith('test_result:')) {
        this.eventsGateway.sendFinalResult(jobId, data);
      }
    });
  }

  async addTestJob(runTestDto: RunTestDto) {
    const job = await this.testQueue.add('run-single-test', runTestDto);
    return job.id;
  }

  async addTestJobAndWaitForResult(runTestDto: RunTestDto): Promise<any> {
    const job = await this.testQueue.add('run-single-test', runTestDto);
    const jobId = String(job.id);
    const resultChannel = `test_result:${jobId}`;
    const subscriber = this.redisClient.duplicate();

    return new Promise(async (resolve) => {
      subscriber.on('message', (channel, message) => {
        if (channel === resultChannel) {
          subscriber.unsubscribe(resultChannel).catch();
          subscriber.quit();
          resolve(JSON.parse(message));
        }
      });

      await subscriber.subscribe(resultChannel);
      console.log(
        `Main-API is waiting for result on channel: ${resultChannel}`,
      );
    });
  }
}
