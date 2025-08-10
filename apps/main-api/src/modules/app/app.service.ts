import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Redis } from 'ioredis';
import { RunTestDto } from '@app/shared';
import { EventsGateway } from '../events/events.gateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService implements OnModuleInit {
  private redisSubscriber: Redis;
  private n8nWebhookUrl: string;

  constructor(
    @InjectQueue('test-queue') private readonly testQueue: Queue,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    private readonly eventsGateway: EventsGateway,
    private readonly configService: ConfigService,
  ) {
    this.redisSubscriber = this.redisClient.duplicate();
    this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL')!;
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
        this.forwardToN8n({ ...data, jobId });
        // this.eventsGateway.sendFinalResult(jobId, data);  <------- Deprecated because we are now using forwardToN8n method.
      }
    });
  }

  async addTestJob(runTestDto: RunTestDto) {
    const job = await this.testQueue.add('run-single-test', runTestDto);
    console.log('Redis client connected to:', this.redisClient.options.host, this.redisClient.options.port);
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

  private async forwardToN8n(data: any,) {
    if (!this.n8nWebhookUrl) {
      console.warn('N8N_WEBHOOK_URL is not set. Skipping forwarding.');
      this.eventsGateway.sendFinalResult(data.jobId, data);
      return;
    }
    try {
      await fetch(this.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      console.log(this.n8nWebhookUrl)
      console.log(`Job ${data.jobId} data forwarded to n8n.`);
    } catch (error) {
      console.error(`Failed to forward job ${data.jobId} to n8n:`, error);
    }
  }

}
