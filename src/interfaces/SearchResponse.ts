import {SearchResult} from './SearchResult';

export interface FacetEntry {
    value: string;
    hitCount: number;
    selected: boolean;
}

export interface SearchResponse {
    facets: Record<string, FacetEntry[]>;
    firstResult: number;
    hits: SearchResult[];
    maxResultHits: number;
    totalHits: number;
}
