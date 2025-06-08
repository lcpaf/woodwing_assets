export interface ChangedMetadata {
    [key: string]: {
        oldValue: string | number | null;
        newValue: string | number | null;
    };
}

export interface UsageStatsRecord {
    id: string | null;
    logDate: number;
    userName: string;
    userGroups: string[];
    clientType: string;
    remoteAddr: string;
    remoteHost: string;
    action: string;
    assetId: string;
    assetPath: string;
    assetType: string;
    assetDomain: string;
    sourceAssetPath: string | null;
    sourceAssetId: string | null;
    changedMetadata: ChangedMetadata;
    details: string | null;
}

export interface HitData {
    permissionMask: number;
    metadata: Record<string, any>;
    relation: any;
}

export interface UsageHit {
    usageStatsRecord: UsageStatsRecord;
    hit: HitData;
    versionCreatingAction: boolean;
}

export interface HistoryResponse {
    totalHits: number;
    hits: UsageHit[];
}
