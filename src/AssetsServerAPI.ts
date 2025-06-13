import { AssetsServerBase } from './AssetsServerBase';
import {
  APICreateFolderRequest,
  DeleteFolderRequest,
  GetFolderRequest,
  ListFoldersRequest,
  SearchFolderRequest,
  UpdateFolderRequest,
} from './interfaces/Request/API';
import { FolderResponse, SearchFolderResponse } from './interfaces/Response/API';

export class AssetsServerAPI {
  constructor(private base: AssetsServerBase) {}

  public async createFolder(req: APICreateFolderRequest): Promise<FolderResponse> {
    return this.base.post('/api/folder', req, true);
  }

  public async getFolder(req: GetFolderRequest): Promise<FolderResponse> {
    if (req.id) {
      return this.base.get(`/api/folder/${encodeURIComponent(req.id)}`);
    } else {
      return this.base.get('/api/folder/get', { path: req.path });
    }
  }

  public async listFolder(req: ListFoldersRequest): Promise<SearchFolderResponse> {
    return this.base.get('/api/folder/list', req);
  }

  public async searchFolder(req: SearchFolderRequest): Promise<SearchFolderResponse> {
    return this.base.get('/api/folder/search', req);
  }

  public async updateFolder(req: UpdateFolderRequest): Promise<FolderResponse> {
    return this.base.put(
      `/api/folder/${req.id}`,
      {
        metadata: req.metadata,
      },
      true,
    );
  }

  public async deleteFolder(req: DeleteFolderRequest): Promise<FolderResponse> {
    return this.base.delete(`/api/folder/${req.id}`);
  }
}
