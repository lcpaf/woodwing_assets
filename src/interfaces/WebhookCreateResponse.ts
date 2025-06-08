export interface WebhookCreateResponse {
    id: string;
    name: string;
    url: string;
    eventTypes: string[];
    metadataToReturn: string[];
    changedMetadataToReturn: string[];
    triggerMetadataFields: string[];
    foldersAndQuery: {
        folders: string[];
        query: string;
    };
    enabled: boolean;
    secretToken: string;
}
