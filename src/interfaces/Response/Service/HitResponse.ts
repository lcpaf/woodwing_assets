export interface HitResponse {
    id: string;
    metadata: Record<string, any>;
    relation: Record<string, any>;
    originalUrl: string;
    permissions: string;
    previewUrl: string;
    thumbnailUrl: string;
}
