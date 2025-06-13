export interface BrowseRequest {
  path: string;
  fromRoot?: string;
  includeFolders?: boolean;
  includeAssets?: boolean;
  includeExtensions?: string;
}
