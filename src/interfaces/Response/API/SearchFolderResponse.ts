import { FolderResponse } from './FolderResponse';

export interface SearchFolderResponse {
  folders: FolderResponse[];
  total: number;
}
