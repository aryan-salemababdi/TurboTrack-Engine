import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { memoryUsage, cpuUsage } from 'process';

@Injectable()
export class ResourceMonitorMiddleware implements NestMiddleware {
  private readonly logger = new Logger('ResourceMonitor');
  private lastCpuUsage: NodeJS.CpuUsage;

  constructor() {
    this.lastCpuUsage = cpuUsage();
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startUsage = this.lastCpuUsage;
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const endUsage = cpuUsage(startUsage);

      const elapsedTimeNs = endTime - startTime;
      const elapsedCpuUsageUs = endUsage.user + endUsage.system;

      const cpuPercentage = (Number(elapsedCpuUsageUs * 1000) / Number(elapsedTimeNs)) * 100;

      const memUsage = memoryUsage();
      const rssMb = (memUsage.rss / 1024 / 1024).toFixed(2);
      const heapUsedMb = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
      
      this.logger.log(
        `[${req.method}] ${req.url} - RAM: ${rssMb}MB (Heap: ${heapUsedMb}MB) | CPU Usage for this request: ~${cpuPercentage.toFixed(2)}%`
      );

      this.lastCpuUsage = cpuUsage();
    });

    next();
  }
}