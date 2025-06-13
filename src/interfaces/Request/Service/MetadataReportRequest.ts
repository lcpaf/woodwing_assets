type ExclusiveSource =
    | { assetIds: string[]; assetPath?: never; q?: never }
    | { assetIds?: never; assetPath: string; q?: never }
    | { assetIds?: never; assetPath?: never; q: string };

export type MetadataReportRequest = ExclusiveSource & {
  format?: 'csv' | 'json';
  fields?: string[];
};
