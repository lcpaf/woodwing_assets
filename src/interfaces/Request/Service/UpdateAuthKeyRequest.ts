export interface UpdateAuthKeyRequest {
  key: string;
  subject: string;
  validUntil: Date;
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
}
