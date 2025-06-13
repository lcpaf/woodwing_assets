import {createReadStream, ReadStream, writeFileSync} from 'fs';
import * as tmp from 'tmp';

import {AssetsServerBase} from './AssetsServerBase';
import {AssetsServerAdmin} from './AssetsServerAdmin';
import {AssetsServerAPI} from './AssetsServerAPI';
import {AssetsConfig} from './AssetsConfig';
import {BrowseResponse, CheckoutResponse, CreateAuthKeyResponse, HistoryResponse, HitResponse, LocalizationResponse, ProcessResponse, ProcessStartResponse, ProfileResponse, SearchResponse} from './interfaces/Response/Service';
import {BrowseRequest, CheckoutRequest, CollectionRequest, CopyRequest, CreateAuthKeyRequest, CreateFolderRequest, CreateRelationRequest, CreateRequest, DownloadFromIdRequest, HistoryRequest, LocalizationRequest, LogUsageRequest, MetadataReportRequest, MoveRequest, PromoteRequest, RemoveRelationRequest, RemoveRequest, RevokeAuthKeysRequest, SearchRequest, SendEmailRequest, UndoCheckoutRequest, UpdateAuthKeyRequest, UpdateBulkRequest, UpdateRequest} from './interfaces/Request/Service';

export class AssetsServer extends AssetsServerBase {
  private tmpDir: tmp.DirResult | null = null;

  public readonly admin: AssetsServerAdmin;
  public readonly api: AssetsServerAPI;

  constructor(config: AssetsConfig) {
    super(config);
    this.admin = new AssetsServerAdmin(this);
    this.api = new AssetsServerAPI(this);
  }

  public async browse(req: BrowseRequest): Promise<BrowseResponse[]> {
    const params: Record<string, string> = {
      path: req.path,
    };
    if (typeof req.includeFolders !== 'undefined') {
      params.includeFolders = String(req.includeFolders);
    }
    if (typeof req.includeAssets !== 'undefined') {
      params.includeAssets = String(req.includeAssets);
    }
    if (typeof req.fromRoot !== 'undefined') {
      params.fromRoot = req.fromRoot;
    }
    if (typeof req.includeExtensions !== 'undefined') {
      params.includeExtensions = req.includeExtensions;
    }
    return this.post('/services/browse', params);
  }

  public async checkout(req: CheckoutRequest): Promise<CheckoutResponse> {
    return await this.post(`/services/checkout/${req.assetId}`, {
      download: 'false',
    });
  }

  public async undoCheckout(req: UndoCheckoutRequest): Promise<void> {
    return await this.post(`/services/undocheckout/${req.assetId}`);
  }

  public async copy(req: CopyRequest & {}): Promise<ProcessResponse>;
  public async copy(req: CopyRequest & { asyncFlag?: false }): Promise<ProcessResponse>;
  public async copy(req: CopyRequest & { asyncFlag: true }): Promise<ProcessStartResponse>;

  public async copy(req: CopyRequest): Promise<ProcessResponse | ProcessStartResponse> {
    const form: Record<string, string> = {
      source: req.source,
      target: req.target,
    };

    if (typeof req.folderReplacePolicy !== 'undefined') {
      form.folderReplacePolicy = req.folderReplacePolicy;
    }

    if (typeof req.fileReplacePolicy !== 'undefined') {
      form.fileReplacePolicy = req.fileReplacePolicy;
    }

    if (typeof req.filterQuery !== 'undefined') {
      form.filterQuery = req.filterQuery;
    }

    if (typeof req.flattenFolders !== 'undefined') {
      form.flattenFolders = String(req.flattenFolders);
    }

    if (typeof req.asyncFlag !== 'undefined') {
      form.async = String(req.asyncFlag);
    }

    return this.post('/services/copy', form);
  }

  public async createAuthKey(req: CreateAuthKeyRequest): Promise<CreateAuthKeyResponse> {
    const form: Record<string, any> = {
      subject: req.subject,
      validUntil: req.validUntil.toISOString(),
    };

    if (typeof req.downloadOriginal !== 'undefined') {
      form.downloadOriginal = String(req.downloadOriginal);
    }

    if (typeof req.downloadPreview !== 'undefined') {
      form.downloadPreview = String(req.downloadPreview);
    }

    if (typeof req.requestApproval !== 'undefined') {
      form.requestApproval = String(req.requestApproval);
    }

    if (typeof req.requestUpload !== 'undefined') {
      form.requestUpload = String(req.requestUpload);
    }

    if (typeof req.watermarked !== 'undefined') {
      form.watermarked = String(req.watermarked);
    }

    if (typeof req.assetIds !== 'undefined' && req.assetIds.length > 0) {
      form.assetIds = req.assetIds.join(',');
    }

    if (typeof req.containerIds !== 'undefined' && req.containerIds.length > 0) {
      form.containerIds = req.containerIds.join(',');
    }

    if (typeof req.downloadPresetIds !== 'undefined' && req.downloadPresetIds.length > 0) {
      form.downloadPresetIds = req.downloadPresetIds.join(',');
    }

    if (typeof req.sort !== 'undefined' && req.sort.length > 0) {
      form.sort = req.sort.join(',');
    }

    if (typeof req.description !== 'undefined') {
      form.description = req.description;
    }

    if (typeof req.containerId !== 'undefined') {
      form.containerId = req.containerId;
    }

    if (typeof req.importFolderPath !== 'undefined') {
      form.importFolderPath = req.importFolderPath;
    }

    if (typeof req.notifyEmail !== 'undefined') {
      form.notifyEmail = req.notifyEmail;
    }

    return this.post('/services/createAuthKey', form);
  }

  public async updateAuthKey(req: UpdateAuthKeyRequest): Promise<void> {
    const form: Record<string, any> = {
      key: req.key,
      subject: req.subject,
      validUntil: req.validUntil.toISOString(),
    };

    if (typeof req.downloadOriginal !== 'undefined') {
      form.downloadOriginal = String(req.downloadOriginal);
    }

    if (typeof req.downloadPreview !== 'undefined') {
      form.downloadPreview = String(req.downloadPreview);
    }

    if (typeof req.requestApproval !== 'undefined') {
      form.requestApproval = String(req.requestApproval);
    }

    if (typeof req.requestUpload !== 'undefined') {
      form.requestUpload = String(req.requestUpload);
    }

    if (typeof req.containerIds !== 'undefined' && req.containerIds.length > 0) {
      form.containerIds = req.containerIds.join(',');
    }

    if (typeof req.downloadPresetIds !== 'undefined' && req.downloadPresetIds.length > 0) {
      form.downloadPresetIds = req.downloadPresetIds.join(',');
    }

    if (typeof req.sort !== 'undefined' && req.sort.length > 0) {
      form.sort = req.sort.join(',');
    }

    if (typeof req.description !== 'undefined') {
      form.description = req.description;
    }

    if (typeof req.containerId !== 'undefined') {
      form.containerId = req.containerId;
    }

    if (typeof req.importFolderPath !== 'undefined') {
      form.importFolderPath = req.importFolderPath;
    }

    if (typeof req.notifyEmail !== 'undefined') {
      form.notifyEmail = req.notifyEmail;
    }

    return this.post('/services/updateAuthKey', form);
  }

  public async revokeAuthKeys(req: RevokeAuthKeysRequest): Promise<void> {
    const form: Record<string, string> = {
      keys: req.keys.join(','),
    };

    return this.post('/services/revokeAuthKeys', form);
  }

  public async search(req: SearchRequest): Promise<SearchResponse> {
    const form: Record<string, any> = {
      q: req.q,
    };

    if (typeof req.start !== 'undefined') {
      form.start = req.start;
    }

    if (typeof req.num !== 'undefined') {
      form.num = req.num;
    }

    if (typeof req.sort !== 'undefined') {
      form.sort = req.sort;
    }

    if (typeof req.metadataToReturn !== 'undefined') {
      form.metadataToReturn = req.metadataToReturn;
    }

    if (typeof req.facets !== 'undefined') {
      form.facets = req.facets;
    }

    if (typeof req.format !== 'undefined') {
      form.format = req.format;
    }

    if (typeof req.appendRequestSecret !== 'undefined') {
      form.appendRequestSecret = String(req.appendRequestSecret);
    }

    if (typeof req.returnHighlightedText !== 'undefined') {
      form.returnHighlightedText = String(req.returnHighlightedText);
    }

    if (typeof req.returnThumbnailHits !== 'undefined') {
      form.returnThumbnailHits = String(req.returnThumbnailHits);
    }

    if (typeof req.logSearch !== 'undefined') {
      form.logSearch = String(req.logSearch);
    }

    return this.post('/services/search', form);
  }

  public async move(req: MoveRequest & {}): Promise<ProcessResponse>;
  public async move(req: MoveRequest & { asyncFlag?: false }): Promise<ProcessResponse>;
  public async move(req: MoveRequest & { asyncFlag: true }): Promise<ProcessStartResponse>;
  public async move(req: MoveRequest): Promise<ProcessResponse | ProcessStartResponse> {
    const form: Record<string, string> = {
      source: req.source,
      target: req.target,
    };

    if (typeof req.folderReplacePolicy !== 'undefined') {
      form.folderReplacePolicy = req.folderReplacePolicy;
    }

    if (typeof req.fileReplacePolicy !== 'undefined') {
      form.fileReplacePolicy = req.fileReplacePolicy;
    }

    if (typeof req.filterQuery !== 'undefined') {
      form.filterQuery = req.filterQuery;
    }

    if (typeof req.flattenFolders !== 'undefined') {
      form.flattenFolders = String(req.flattenFolders);
    }

    if (typeof req.asyncFlag !== 'undefined') {
      form.async = String(req.asyncFlag);
    }

    return this.post('/services/move', form);
  }

  public async update(req: UpdateRequest): Promise<void> {
    const form: Record<string, any> = {
      id: req.id,
    };

    if (typeof req.metadataToReturn !== 'undefined') {
      form.metadataToReturn = req.metadataToReturn;
    }

    if (typeof req.clearCheckoutState !== 'undefined') {
      form.clearCheckoutState = String(req.clearCheckoutState);
    }

    if (typeof req.parseMetadataModifications !== 'undefined') {
      form.parseMetadataModifications = String(req.parseMetadataModifications);
    }

    if (typeof req.keepMetadata !== 'undefined') {
      form.keepMetadata = String(req.keepMetadata);
    }

    if (req.Filedata) {
      form.Filedata = this.prepareFiledataStream(req.Filedata);
    }

    if (req.metadata) {
      form.metadata = JSON.stringify(req.metadata);
    }

    return this.post('/services/update', form);
  }

  public async updateBulk(req: UpdateBulkRequest & {}): Promise<ProcessResponse>;
  public async updateBulk(req: UpdateBulkRequest & { asyncFlag?: false }): Promise<ProcessResponse>;
  public async updateBulk(req: UpdateBulkRequest & { asyncFlag: true }): Promise<ProcessStartResponse>;

  public async updateBulk(req: UpdateBulkRequest): Promise<ProcessResponse | ProcessStartResponse> {
    const form: Record<string, string> = {
      q: req.q,
      metadata: JSON.stringify(req.metadata),
    };

    if (typeof req.asyncFlag !== 'undefined') {
      form.async = String(req.asyncFlag);
    }

    if (typeof req.parseMetadataModifications !== 'undefined') {
      form.parseMetadataModifications = String(req.parseMetadataModifications);
    }

    return this.post('/services/updatebulk', form);
  }

  public async remove(req: RemoveRequest & {}): Promise<ProcessResponse>;
  public async remove(req: RemoveRequest & { asyncFlag?: false }): Promise<ProcessResponse>;
  public async remove(req: RemoveRequest & { asyncFlag: true }): Promise<ProcessStartResponse>;

  public async remove(req: RemoveRequest): Promise<ProcessResponse | ProcessStartResponse> {
    const form: Record<string, string> = {
      async: String(req.asyncFlag ?? false),
    };

    if (typeof req.q !== 'undefined') {
      form.q = req.q;
    }

    if (typeof req.ids !== 'undefined' && req.ids.length > 0) {
      form.ids = req.ids.join(',');
    }

    if (typeof req.folderPath !== 'undefined') {
      form.folderPath = req.folderPath;
    }

    return this.post('/services/remove', form);
  }

  public async create(req: CreateRequest): Promise<HitResponse> {
    const form: Record<string, any> = {};

    if (typeof req.metadataToReturn !== 'undefined') {
      form.metadataToReturn = req.metadataToReturn;
    }

    if (req.Filedata) {
      form.Filedata = this.prepareFiledataStream(req.Filedata);
    }

    if (req.metadata) {
      form.metadata = JSON.stringify(req.metadata);
    }

    return await this.post('/services/create', form);
  }

  public async createFolder(req: CreateFolderRequest): Promise<Record<string, string>> {
    return await this.post('/services/createFolder', {path: req.path}) as Record<string, string>;
  }

  public async createRelation(req: CreateRelationRequest): Promise<void> {
    return this.post('/services/createRelation', {
      relationType: req.relationType,
      target1Id: req.target1Id,
      target2Id: req.target2Id,
    });
  }

  public async removeRelation(req: RemoveRelationRequest): Promise<ProcessResponse> {
    return this.post('/services/removeRelation', {
      relationIds: req.relationIds.join(','),
    });
  }

  public async sendEmail(req: SendEmailRequest): Promise<void> {
    const form: Record<string, string> = {
      to: req.to,
      subject: req.subject,
    };

    if (typeof req.body !== 'undefined') {
      form.body = req.body;
    }

    if (typeof req.htmlBody !== 'undefined') {
      form.htmlBody = req.htmlBody;
    }

    return this.post('/services/notify/email', form, true);
  }

  public async localization(req: LocalizationRequest): Promise<LocalizationResponse> {
    const form: Record<string, string> = {};

    if (typeof req.localeChain !== 'undefined') {
      form.localeChain = req.localeChain.join(',');
    }

    if (typeof req.ifModifiedSince !== 'undefined') {
      form.ifModifiedSince = req.ifModifiedSince.toISOString();
    }

    if (typeof req.bundle !== 'undefined') {
      form.bundle = req.bundle;
    }

    return this.post('/services/messages', form);
  }

  public async logUsage(req: LogUsageRequest): Promise<void> {
    const action = req.action.startsWith('CUSTOM_ACTION_')
        ? req.action
        : `CUSTOM_ACTION_${req.action}`;

    const form: Record<string, string> = {
      assetId: req.assetId,
      action,
    };

    return this.post('/services/logUsage', form);
  }

  public async removeFromCollection(req: CollectionRequest): Promise<void> {
    return this.post('/services/collection/remove', {
      childIds: req.childIds.join(','),
      collectionId: req.collectionId,
    });
  }

  public async addToCollection(req: CollectionRequest): Promise<void> {
    return this.post('/services/collection/add', {
      childIds: req.childIds.join(','),
      collectionId: req.collectionId,
    });
  }

  public async history(req: HistoryRequest): Promise<HistoryResponse> {
    const form: Record<string, any> = {
      id: req.id,
    };

    if (typeof req.start !== 'undefined') {
      form.start = req.start;
    }

    if (typeof req.num !== 'undefined') {
      form.num = req.num;
    }

    if (typeof req.detailLevel !== 'undefined') {
      form.detailLevel = req.detailLevel;
    }

    if (typeof req.actions !== 'undefined' && req.actions.length > 0) {
      form.actions = req.actions.join(',');
    }

    return await this.post('/services/asset/history', form);
  }

  public async promote(req: PromoteRequest): Promise<void> {
    return this.post('/services/version/promote', {
      assetId: req.assetId,
      version: req.version,
    });
  }

  public async getMetadataReport(req: MetadataReportRequest): Promise<string> {
    this.ensureTmpDir();
    const filePath = tmp.tmpNameSync({dir: this.tmpDir!.name});
    const params: Record<string, string> = {};

    if (typeof req.assetIds !== 'undefined' && req.assetIds.length > 0) {
      params.assetIds = req.assetIds.join(',');
    }

    if (typeof req.assetPath !== 'undefined') {
      params.assetPath = req.assetPath;
    }

    if (typeof req.fields !== 'undefined' && req.fields.length > 0) {
      params.fields = req.fields.join(',');
    }

    if (typeof req.q !== 'undefined') {
      params.q = req.q;
    }

    const query = new URLSearchParams(params).toString();
    const format = req.format ?? 'csv';
    const endpoint = `/metadata/report.${format}?${query}`;
    await this.download(endpoint, filePath);
    return filePath;
  }

  public async profile(): Promise<ProfileResponse> {
    return this.post('/services/profile');
  }

  public async downloadFromId(req: DownloadFromIdRequest): Promise<string> {
    this.ensureTmpDir();
    const filePath = tmp.tmpNameSync({dir: this.tmpDir!.name});

    const assetName = req.assetName ?? req.assetId;
    const endpoint = `/file/${req.assetId}/*/${assetName}?forceDownload=true`;

    try {
      await this.download(endpoint, filePath);
      return filePath;
    }
    catch (err) {
      throw err;
    }
  }

  public async downloadPreviewFromId(req: DownloadFromIdRequest): Promise<string> {
    this.ensureTmpDir();
    const filePath = tmp.tmpNameSync({dir: this.tmpDir!.name});

    const assetName = req.assetName ?? req.assetId;
    const endpoint = `/preview/${req.assetId}/*/${assetName}.jpg?forceDownload=true`;

    try {
      await this.download(endpoint, filePath);
      return filePath;
    }
    catch (err) {
      throw err;
    }
  }

  private ensureTmpDir(): void {
    if (!this.tmpDir) {
      this.tmpDir = tmp.dirSync();
    }
  }

  private prepareFiledataStream(filedata: Buffer | ReadStream): ReadStream {
    if (Buffer.isBuffer(filedata)) {
      this.ensureTmpDir(); // make sure tmpDir exists
      const tmpPath = tmp.tmpNameSync({dir: this.tmpDir!.name});
      writeFileSync(tmpPath, filedata);
      return createReadStream(tmpPath);
    }

    // already a ReadStream
    return filedata;
  }
}
