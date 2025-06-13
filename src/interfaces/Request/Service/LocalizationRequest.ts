export interface LocalizationRequest {
  localeChain?: string[];
  ifModifiedSince?: Date;
  bundle?: 'web' | 'acm';
}
