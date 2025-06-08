export interface SearchResult {
    /** Unique asset ID */
    id: string;

    /** Metadata key-value pairs */
    metadata: Record<string, any>;

    /** Metadata key-value pairs */
    relation: Record<string, any>;

    /** Direct URL to the original file */
    originalUrl: string;

    /** Permissions string (e.g., read/write flags) */
    permissions: string;

    /** URL to the preview image */
    previewUrl: string;

    /** URL to the thumbnail image */
    thumbnailUrl: string;
}
