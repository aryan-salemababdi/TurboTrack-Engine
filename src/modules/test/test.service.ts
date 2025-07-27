import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';
import fetch from 'node-fetch';
import { RunTestType } from 'src/common/types/runTest.type';

@Injectable()
export class TestService {
  async runTest({
    url,
    requests,
    concurrency,
    method = 'GET',
  }: RunTestType) {
    let success = 0;
    let failed = 0;
    const latencies: number[] = [];

    const doRequest = async () => {
      const start = performance.now();
      try {
        const res = await fetch(url, { method });
        if (res.ok) success++;
        else failed++;
      } catch {
        failed++;
      }
      const end = performance.now();
      latencies.push(end - start);
    };

    const queue = Array.from({ length: requests }, () => () => doRequest());

    const runWithConcurrency = async () => {
      const chunks: Array<Array<() => Promise<void>>> = [];
      for (let i = 0; i < queue.length; i += concurrency) {
        chunks.push(queue.slice(i, i + concurrency));
      }

      const startTime = performance.now();
      for (const chunk of chunks) {
        await Promise.all(chunk.map((fn) => fn()));
      }
      const endTime = performance.now();

      const avgLatency =
        latencies.reduce((sum, l) => sum + l, 0) / latencies.length;

      return {
        totalRequests: requests,
        success,
        failed,
        avgLatency: Number(avgLatency.toFixed(2)),
        RPS: Number((requests / ((endTime - startTime) / 1000)).toFixed(2)),
        durationMs: Number((endTime - startTime).toFixed(2)),
      };
    };

    return runWithConcurrency();
  }
}
