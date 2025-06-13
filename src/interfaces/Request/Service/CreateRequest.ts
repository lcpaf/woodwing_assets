import {ReadStream} from 'fs';

type RequireFileOrMetadata =
    | { Filedata: ReadStream | Buffer; metadata?: Record<string, any> }
    | { Filedata?: ReadStream | Buffer; metadata: Record<string, any> };

export type CreateRequest = RequireFileOrMetadata & {
  metadataToReturn?: string;
};
