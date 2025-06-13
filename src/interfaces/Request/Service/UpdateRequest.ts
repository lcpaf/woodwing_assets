import {ReadStream} from 'fs';

type RequireAtLeastOneContent =
    | { Filedata: ReadStream | Buffer; metadata?: Record<string, any> }
    | { Filedata?: ReadStream | Buffer; metadata: Record<string, any> };

export type UpdateRequest = RequireAtLeastOneContent & {
  id: string;
  metadataToReturn?: string;
  clearCheckoutState?: boolean;
  parseMetadataModifications?: boolean;
  keepMetadata?: boolean;
};
