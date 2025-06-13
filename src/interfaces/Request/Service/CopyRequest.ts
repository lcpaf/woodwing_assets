export interface CopyRequest {
  source: string;
  target: string;
  folderReplacePolicy?: string;
  fileReplacePolicy?: string;
  filterQuery?: string;
  flattenFolders?: boolean;
  asyncFlag?: boolean;
}
