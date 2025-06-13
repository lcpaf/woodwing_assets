import {HitResponse} from './HitResponse';

export interface FacetEntry {
  value: string;
  hitCount: number;
  selected: boolean;
}

export interface SearchResponse {
  facets: Record<string, FacetEntry[]>;
  firstResult: number;
  hits: HitResponse[];
  maxResultHits: number;
  totalHits: number;
}
