import {SearchResult} from './SearchResult';

export interface SearchResponse {
    /** Facets returned by the search (e.g., categories, tags) */
    facets: Record<string, any>;

    /** Index of the first result (for pagination) */
    firstResult: number;

    /** Array of matched asset hits */
    hits: SearchResult[];

    /** Maximum number of hits returned in this response */
    maxResultHits: number;

    /** Total number of hits matching the query */
    totalHits: number;
}
