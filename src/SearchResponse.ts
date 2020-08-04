import {Hit} from "./Hit";

export interface SearchResponse {
    facets: object,
    firstResult: number,
    hits: [Hit],
    maxResultHits: number,
    totalHits: number
}