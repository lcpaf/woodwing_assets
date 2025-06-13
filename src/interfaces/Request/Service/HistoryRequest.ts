export interface HistoryRequest {
  id: string;
  start?: number;
  num?: number;
  detailLevel?: 0 | 1 | 2 | 3 | 4 | 5;
  actions?: string[];
}
