import {AssetsServerBase} from './AssetsServerBase';
import {ReadStream} from 'fs';
import * as tmp from 'tmp';
import {SearchResponse} from './interfaces/SearchResponse';
import {SearchResult} from './interfaces/SearchResult';
import {BrowseResult} from './interfaces/BrowseResult';
import {ProcessResponse} from './interfaces/ProcessResponse';
import {ProcessStartResponse} from './interfaces/ProcessStartResponse';
import {CheckoutResponse} from './interfaces/CheckoutResponse';
import {CreateAuthKeyResponse} from "./interfaces/CreateAuthKeyResponse";
import {LocalizationResponse} from "./interfaces/LocalizationResponse";
import {ProfileResponse} from "./interfaces/ProfileResponse";
import {HistoryResponse} from "./interfaces/HistoryResponse";

export class AssetsServer extends AssetsServerBase {
    private tmpDir: tmp.DirResult | null = null;

    public async browse(
        path: string,
        fromRoot: string | null = null,
        includeFolders: boolean = true,
        includeAssets: boolean = true,
        includeExtensions: string | null = null,
    ): Promise<BrowseResult[]> {
        const params: Record<string, string> = {
            path,
            includeFolders: String(includeFolders),
            includeAssets: String(includeAssets),
        };

        if (fromRoot) params.fromRoot = fromRoot;
        if (includeExtensions) params.includeExtensions = includeExtensions;

        return await this.post('/services/browse', params);
    }

    public async checkout(
        assetId: string,
    ): Promise<CheckoutResponse> {
        return await this.post(`/services/checkout/${assetId}`, {
            download: 'false',
        });
    }

    public async copy(
        source: string,
        target: string,
        folderReplacePolicy?: string,
        fileReplacePolicy?: string,
        filterQuery?: string,
        flattenFolders?: boolean,
        asyncFlag?: false
    ): Promise<ProcessResponse>;

    public async copy(
        source: string,
        target: string,
        folderReplacePolicy?: string,
        fileReplacePolicy?: string,
        filterQuery?: string,
        flattenFolders?: boolean,
        asyncFlag?: true
    ): Promise<ProcessStartResponse>;

    public async copy(
        source: string,
        target: string,
        folderReplacePolicy: string = AssetsServerBase.FOLDER_REPLACE_POLICY_AUTO_RENAME,
        fileReplacePolicy: string = AssetsServerBase.FILE_REPLACE_POLICY_AUTO_RENAME,
        filterQuery: string = '',
        flattenFolders: boolean = false,
        asyncFlag: boolean = false
    ): Promise<ProcessResponse | ProcessStartResponse> {
        return this.post('/services/copy', {
            source,
            target,
            folderReplacePolicy,
            fileReplacePolicy,
            filterQuery,
            flattenFolders: String(flattenFolders),
            async: String(asyncFlag),
        });
    }

    public async createAuthKey(
        subject: string,
        validUntil: Date,
        assetIds: null | string[] = null,
        description: string | null = null,
        downloadOriginal: boolean = false,
        downloadPreview: boolean = false,
        requestApproval: boolean = false,
        requestUpload: boolean = false,
        containerId: string | null = null,
        containerIds: string[] = [],
        importFolderPath: string | null = null,
        notifyEmail: string | null = null,
        sort: string[] = [],
        downloadPresetIds: string[] = [],
        watermarked: boolean = false
    ): Promise<CreateAuthKeyResponse> {
        const form: Record<string, any> = {
            subject,
            validUntil: validUntil.toISOString(),
            downloadOriginal: String(downloadOriginal),
            downloadPreview: String(downloadPreview),
            requestApproval: String(requestApproval),
            requestUpload: String(requestUpload),
            watermarked: String(watermarked),
        };

        if (assetIds) form.assetIds = assetIds.join(',');
        if (containerIds.length > 0) form.containerIds = containerIds.join(',');
        if (downloadPresetIds.length > 0) form.downloadPresetIds = downloadPresetIds.join(',');
        if (sort.length > 0) form.sort = sort.join(',');
        if (description) form.description = description;
        if (containerId) form.containerId = containerId;
        if (importFolderPath) form.importFolderPath = importFolderPath;
        if (notifyEmail) form.notifyEmail = notifyEmail;

        return this.post('/services/createAuthKey', form);
    }

    public async updateAuthKey(
        key: string,
        subject: string,
        validUntil: Date,
        description: string | null = null,
        downloadOriginal: boolean = false,
        downloadPreview: boolean = false,
        requestApproval: boolean = false,
        requestUpload: boolean = false,
        containerId: string | null = null,
        containerIds: string[] = [],
        importFolderPath: string | null = null,
        notifyEmail: string | null = null,
        sort: string[] = [],
        downloadPresetIds: string[] = []
    ): Promise<void> {
        const form: Record<string, any> = {
            key,
            subject,
            validUntil: validUntil.toISOString(),
            downloadOriginal: String(downloadOriginal),
            downloadPreview: String(downloadPreview),
            requestApproval: String(requestApproval),
            requestUpload: String(requestUpload),
        };

        if (containerIds.length > 0) form.containerIds = containerIds.join(',');
        if (downloadPresetIds.length > 0) form.downloadPresetIds = downloadPresetIds.join(',');
        if (sort.length > 0) form.sort = sort.join(',');
        if (description) form.description = description;
        if (containerId) form.containerId = containerId;
        if (importFolderPath) form.importFolderPath = importFolderPath;
        if (notifyEmail) form.notifyEmail = notifyEmail;

        return this.post('/services/updateAuthKey', form);
    }

    public async revokeAuthKeys(
        keys: string[],
    ): Promise<void> {
        const form: Record<string, any> = {
            keys: keys?.join(),
        };
        return this.post('/services/revokeAuthKeys', form);
    }

    public async undoCheckout(
        assetId: string,
    ): Promise<void> {
        return await this.post(`/services/undocheckout/${assetId}`);
    }

    public async search(
        q: string,
        start: number = 0,
        num: number = 50,
        sort: string = 'assetCreated-desc',
        metadataToReturn: string = 'all',
        facets: string | null = null,
        format: string = 'json',
        appendRequestSecret: boolean = false,
        returnHighlightedText: boolean = true,
        returnThumbnailHits: boolean = false,
        logSearch: boolean = true,
    ): Promise<SearchResponse> {
        const form: Record<string, any> = {
            q,
            start,
            num,
            sort,
            metadataToReturn,
            format,
            appendRequestSecret: String(appendRequestSecret),
            returnHighlightedText: String(returnHighlightedText),
            returnThumbnailHits: String(returnThumbnailHits),
            logSearch: String(logSearch),
        };
        if (facets !== null) form.facets = facets;
        return await this.post('/services/search', form);
    }

    public async move(
        source: string,
        target: string,
        folderReplacePolicy?: string,
        fileReplacePolicy?: string,
        filterQuery?: string,
        flattenFolders?: boolean,
        asyncFlag?: false,
    ): Promise<ProcessResponse>;

    public async move(
        source: string,
        target: string,
        folderReplacePolicy?: string,
        fileReplacePolicy?: string,
        filterQuery?: string,
        flattenFolders?: boolean,
        asyncFlag?: true
    ): Promise<ProcessStartResponse>;

    public async move(
        source: string,
        target: string,
        folderReplacePolicy: string = AssetsServerBase.FOLDER_REPLACE_POLICY_AUTO_RENAME,
        fileReplacePolicy: string = AssetsServerBase.FILE_REPLACE_POLICY_AUTO_RENAME,
        filterQuery: string = '',
        flattenFolders: boolean = false,
        asyncFlag: boolean = false
    ): Promise<ProcessResponse | ProcessStartResponse> {
        return this.post('/services/move', {
            source,
            target,
            folderReplacePolicy,
            fileReplacePolicy,
            filterQuery,
            flattenFolders: String(flattenFolders),
            async: String(asyncFlag),
        });
    }

    public async update(
        id: string,
        Filedata: ReadStream | null = null,
        metadata: object | null = null,
        metadataToReturn: string = 'all',
        clearCheckoutState: boolean = true,
        parseMetadataModifications: boolean = true,
        keepMetadata: boolean = false,
    ): Promise<void> {
        const form: Record<string, any> = {
            id,
            metadataToReturn,
            clearCheckoutState: String(clearCheckoutState),
            parseMetadataModifications: String(parseMetadataModifications),
            keepMetadata: String(keepMetadata),
        };

        if (Filedata) form.Filedata = Filedata;
        if (metadata) form.metadata = JSON.stringify(metadata);

        return this.post('/services/update', form);
    }

    public async updateBulk(
        q: string,
        metadata: Record<string, any>,
        asyncFlag?: false
    ): Promise<ProcessResponse>;

    public async updateBulk(
        q: string,
        metadata: Record<string, any>,
        asyncFlag?: true
    ): Promise<ProcessStartResponse>;

    public async updateBulk(
        q: string,
        metadata: Record<string, any>,
        asyncFlag: boolean = false,
        parseMetadataModifications: boolean = true,
    ): Promise<ProcessResponse | ProcessStartResponse> {
        const form: Record<string, any> = {
            q,
            metadata: JSON.stringify(metadata),
            async: String(asyncFlag),
            parseMetadataModifications: String(parseMetadataModifications),
        };
        return this.post('/services/updatebulk', form);
    }

    public async remove(
        q?: string | null,
        ids?: string[] | null,
        folderPath?: string | null,
        asyncFlag?: false
    ): Promise<ProcessResponse>;

    public async remove(
        q?: string | null,
        ids?: string[] | null,
        folderPath?: string | null,
        asyncFlag?: true
    ): Promise<ProcessStartResponse>;

    public async remove(
        q: string | null = null,
        ids: string[] | null = null,
        folderPath: string | null = null,
        asyncFlag: boolean = false
    ): Promise<ProcessResponse | ProcessStartResponse> {
        const form: Record<string, any> = {
            async: String(asyncFlag),
        };
        if (q) form.q = q;
        if (ids) form.ids = ids.join(',');
        if (folderPath) form.folderPath = folderPath;

        return this.post('/services/remove', form);
    }

    public async create(
        Filedata: ReadStream | null = null,
        metadata: object | null = null,
        metadataToReturn: string = 'all',
    ): Promise<SearchResult> {
        const form: { [k: string]: any } = {metadataToReturn};

        if (Filedata) form.Filedata = Filedata;
        if (metadata) form.metadata = JSON.stringify(metadata);

        const result = await this.post('/services/create', form);
        return result as SearchResult;
    }

    public async createFolder(path: string): Promise<Record<string, string>> {
        return await this.post('/services/createFolder', {path}) as Record<string, string>;
    }

    public async createRelation(
        relationType: string,
        target1Id: string,
        target2Id: string
    ): Promise<void> {
        return this.post('/services/createRelation', {
            relationType,
            target1Id,
            target2Id,
        });
    }

    public async sendEmail(
        to: string,
        subject: string,
        body: null | string = null,
        htmlBody: null | string = null,
    ): Promise<void> {
        const form: Record<string, any> = {
            to,
            subject,
        };

        if (body) form.body = body;
        if (htmlBody) form.htmlBody = htmlBody;
        return this.post('/services/notify/email', form, true);
    }

    public async localization(
        localeChain: null | string[] = null,
        ifModifiedSince: Date | null = null,
        bundle: null | 'web' | 'acm' = null,
    ): Promise<LocalizationResponse> {
        const form: { [k: string]: any } = {};
        if (localeChain) form.localeChain = localeChain.join(',');
        if (ifModifiedSince) form.ifModifiedSince = ifModifiedSince.toISOString();
        if (bundle) form.bundle = bundle;
        return this.post('/services/messages', form);
    }

    public async logUsage(
        assetId: string,
        action: string,
    ): Promise<void> {

        if (!action.startsWith('CUSTOM_ACTION_')) {
            action = `CUSTOM_ACTION_${action}`;
        }

        const form: Record<string, any> = {
            assetId,
            action,
        };
        return this.post('/services/logUsage', form);
    }

    public async removeRelation(relationIds: string[]): Promise<ProcessResponse> {
        return this.post('/services/removeRelation', {
            relationIds: relationIds.join(','),
        });
    }

    public async removeFromCollection(
        childIds: string[],
        collectionId: string
    ): Promise<void> {
        return this.post('/services/collection/remove', {
            childIds: childIds.join(','),
            collectionId,
        });
    }

    public async addToCollection(
        childIds: string[],
        collectionId: string
    ): Promise<void> {
        return this.post('/services/collection/add', {
            childIds: childIds.join(','),
            collectionId,
        });
    }

    public async history(
        id: string,
        start: number = 0,
        num: number = 50,
        detailLevel: 0 | 1 | 2 | 3 | 4 | 5 = 0,
        actions: string[] = [],
    ): Promise<HistoryResponse> {
        const form: Record<string, any> = {
            id,
            start,
            num,
            detailLevel,
        };

        if (actions.length > 0) {
            form.actions = actions.join(',');
        }

        return await this.post('/services/asset/history', form);
    }


    public async promote(
        assetId: string,
        version: number
    ): Promise<void> {
        return this.post('/services/version/promote', {
            assetId,
            version,
        });
    }

    public async getMetadataReport(
        format: 'csv' | 'json' = 'csv',
        assetIds: null | string[] = null,
        assetPath: null | string = null,
        fields: null | string[] = null,
        q?: string,
    ): Promise<string> {
        this.ensureTmpDir();
        const filePath = tmp.tmpNameSync({dir: this.tmpDir!.name});
        const params: Record<string, string> = {};

        if (assetIds) params.assetIds = assetIds.join(',');
        if (assetPath) params.assetPath = assetPath;
        if (fields) params.fields = fields.join(',');
        if (q) params.q = q;

        const query = new URLSearchParams(params).toString();
        const endpoint = `/metadata/report.${format}?${query}`;
        await this.download(endpoint, filePath);
        return filePath;
    }

    public async profile(): Promise<ProfileResponse> {
        return this.post('/services/profile');
    }

    public async downloadFromId(assetId: string, assetName: string | null = null): Promise<string> {
        this.ensureTmpDir();
        const filePath = tmp.tmpNameSync({dir: this.tmpDir!.name});

        try {
            await this.download(`/file/${assetId}/*/${assetName ?? assetId}?forceDownload=true`, filePath);
            return filePath;
        } catch (err) {
            throw err;
        }
    }

    public async downloadPreviewFromId(assetId: string, assetName: string | null = null): Promise<string> {
        this.ensureTmpDir();
        const filePath = tmp.tmpNameSync({dir: this.tmpDir!.name});

        try {
            await this.download(`/preview/${assetId}/*/${assetName ?? assetId}.jpg?forceDownload=true`, filePath);
            return filePath;
        } catch (err) {
            throw err;
        }
    }

    private ensureTmpDir(): void {
        if (!this.tmpDir) {
            this.tmpDir = tmp.dirSync();
        }
    }
}
