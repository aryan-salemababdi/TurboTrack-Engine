import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';
import { RunTestType } from '../../common/types/runTest.type';


@Injectable()
export class TestProcessorService {

  async runBatchTest({
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
      } finally {
        const end = performance.now();
        latencies.push(end - start);
      }
    };

    const startTime = performance.now();
    let requestsMade = 0;
    while (requestsMade < requests) {
      const batchSize = Math.min(concurrency, requests - requestsMade);
      const promiseBatch: Promise<void>[] = [];

      for (let i = 0; i < batchSize; i++) {
        promiseBatch.push(doRequest());
      }

      await Promise.all(promiseBatch);
      requestsMade += batchSize;
    }

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    const avgLatency =
      latencies.reduce((sum, l) => sum + l, 0) / latencies.length || 0;

    return {
      totalRequests: requestsMade,
      success,
      failed,
      avgLatency: Number(avgLatency.toFixed(2)),
      RPS: Number((requests / (durationMs / 1000)).toFixed(2)),
      durationMs: Number(durationMs.toFixed(2)),
    };
  }
  
  async runSustainedTest({
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
      } finally {
        const end = performance.now();
        latencies.push(end - start);
      }
    };

    const startTime = performance.now();

    const worker = async (requestsToRun: number) => {
      for (let i = 0; i < requestsToRun; i++) {
        await doRequest();
      }
    };

    const workerPool: Promise<void>[] = [];
    const activeConcurrency = Math.min(concurrency, requests);
    const requestsPerWorker = Math.floor(requests / activeConcurrency);
    let requestsRemainder = requests % activeConcurrency;

    for (let i = 0; i < activeConcurrency; i++) {
      let tasksForThisWorker = requestsPerWorker;
      if (requestsRemainder > 0) {
        tasksForThisWorker++;
        requestsRemainder--;
      }
      if (tasksForThisWorker > 0) {
        workerPool.push(worker(tasksForThisWorker));
      }
    }

    await Promise.all(workerPool);

    const endTime = performance.now();
    const durationMs = endTime - startTime;
    const avgLatency =
      latencies.reduce((sum, l) => sum + l, 0) / latencies.length || 0;

    return {
      totalRequests: requests,
      success,
      failed,
      avgLatency: Number(avgLatency.toFixed(2)),
      RPS: Number((requests / (durationMs / 1000)).toFixed(2)),
      durationMs: Number(durationMs.toFixed(2)),
    };
  }
  
}
