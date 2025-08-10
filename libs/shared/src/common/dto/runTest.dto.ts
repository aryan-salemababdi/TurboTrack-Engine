export class RunTestDto {
  url: string;
  requests: number;
  concurrency: number;
  method: 'GET' | 'POST';
  testType: 'batch' | 'sustained';
}