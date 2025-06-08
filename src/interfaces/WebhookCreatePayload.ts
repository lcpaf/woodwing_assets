export interface WebhookCreatePayload {
    enabled: boolean;
    name: string;
    url: string;
    eventTypes: string[];
    metadataToReturn: string[];
    changedMetadataToReturn: string[];
    triggerMetadataFields?: string[];
    foldersAndQuery: {
        folders: string[];
        query: string;
        enableWildcardSelection?: boolean;
    };
}
