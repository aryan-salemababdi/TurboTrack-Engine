import { TestService } from './test.service';
import { RunTestType } from 'src/common/types/runTest.type';

global.fetch = jest.fn();

describe('TestService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
    jest.clearAllMocks();
  });

  it('should send the correct number of requests and collect stats', async () => {
    const mockResponse = { ok: true };
    (fetch as jest.Mock).mockResolvedValue(mockResponse);

    const input: RunTestType = {
      url: 'https://example.com',
      requests: 10,
      concurrency: 2,
      method: 'GET',
    };

    const result = await service.runTest(input);

    expect(fetch).toHaveBeenCalledTimes(10);
    expect(result.totalRequests).toBe(10);
    expect(result.success).toBe(10);
    expect(result.failed).toBe(0);
    expect(typeof result.avgLatency).toBe('number');
    expect(typeof result.RPS).toBe('number');
    expect(typeof result.durationMs).toBe('number');
  });

  it('should count failed requests correctly', async () => {
    const responses = Array(10)
      .fill(null)
      .map((_, i) =>
        i % 2 === 0 ? { ok: true } : { ok: false }
      );

    (fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve(responses.shift())
    );

    const input: RunTestType = {
      url: 'https://example.com',
      requests: 10,
      concurrency: 5,
      method: 'GET',
    };

    const result = await service.runTest(input);

    expect(result.success).toBe(5);
    expect(result.failed).toBe(5);
  });

  it('should handle thrown fetch errors as failed requests', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    const input: RunTestType = {
      url: 'https://example.com',
      requests: 5,
      concurrency: 2,
      method: 'GET',
    };

    const result = await service.runTest(input);

    expect(result.success).toBe(0);
    expect(result.failed).toBe(5);
  });
});