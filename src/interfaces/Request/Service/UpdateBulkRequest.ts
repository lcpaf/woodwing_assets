export interface UpdateBulkRequest {
  q: string;
  metadata: Record<string, any>;
  asyncFlag?: boolean;
  parseMetadataModifications?: boolean;
}
