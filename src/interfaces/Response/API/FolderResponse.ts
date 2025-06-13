export interface FolderResponse {
  id: string;
  name: string;
  path: string;
  permissions: string;
  metadata: Record<string, any>;
}
