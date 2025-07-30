export interface RunTestType { 
    url: string;
    requests: number;
    concurrency: number;
    method: 'GET' | 'POST';
}