export interface CreateAuthKeyRequest {
  subject: string;
  validUntil: Date;
  assetIds?: string[];
  description?: string;
  downloadOriginal?: boolean;
  downloadPreview?: boolean;
  requestApproval?: boolean;
  requestUpload?: boolean;
  containerId?: string;
  containerIds?: string[];
  importFolderPath?: string;
  notifyEmail?: string;
  sort?: string[];
  downloadPresetIds?: string[];
  watermarked?: boolean;
}
