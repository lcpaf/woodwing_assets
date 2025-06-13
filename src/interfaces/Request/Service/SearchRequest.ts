export interface SearchRequest {
  q: string;
  start?: number;
  num?: number;
  sort?: string;
  metadataToReturn?: string;
  facets?: string;
  format?: string;
  appendRequestSecret?: boolean;
  returnHighlightedText?: boolean;
  returnThumbnailHits?: boolean;
  logSearch?: boolean;
}
