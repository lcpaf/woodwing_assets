import {AssetsServerBase} from './AssetsServerBase';
import {ReadStream} from 'fs';
import * as tmp from 'tmp';
import {SearchResponse} from './interfaces/SearchResponse';
import {SearchResult} from './interfaces/SearchResult';
import {BrowseResult} from './interfaces/BrowseResult';
import {ProcessResponse} from './interfaces/ProcessResponse';
import {CheckoutResponse} from './interfaces/CheckoutResponse';
import {CreateAuthKeyResponse} from "./interfaces/CreateAuthKeyResponse";

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

        const response = await this.post('/services/browse', params);
        return response as BrowseResult[];
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
        folderReplacePolicy: string = this.FOLDER_REPLACE_POLICY_AUTO_RENAME,
        fileReplacePolicy: string = this.FILE_REPLACE_POLICY_AUTO_RENAME,
        filterQuery: string = '',
        flattenFolders: boolean = false,
        asyncFlag: boolean = false
    ): Promise<ProcessResponse> {
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


    public async undoCheckout(
        assetId: string,
    ): Promise<unknown> {
        return await this.post(`/services/undocheckout/${assetId}`);
    }

    public async search(
        q: string,
        start: number = 0,
        num: number = 50,
        sort: string = 'assetCreated-desc',
        metadataToReturn: string = 'all',
        facets: null | string = null,
        format: string = 'json',
        appendRequestSecret: boolean = false,
        returnHighlightedText: boolean = true
    ): Promise<SearchResponse> {
        return await this.post('/services/search', {
            q,
            start,
            num,
            sort,
            metadataToReturn,
            facets,
            format,
            appendRequestSecret: String(appendRequestSecret),
            returnHighlightedText: String(returnHighlightedText),
        });
    }

    public async move(
        source: string,
        target: string,
        folderReplacePolicy: string = this.FOLDER_REPLACE_POLICY_AUTO_RENAME,
        fileReplacePolicy: string = this.FILE_REPLACE_POLICY_AUTO_RENAME,
        filterQuery: string = '',
        flattenFolders: boolean = false,
        asyncFlag: boolean = false
    ): Promise<ProcessResponse> {
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
        parseMetadataModifications: boolean = true
    ): Promise<unknown> {
        const form: Record<string, any> = {
            id,
            metadataToReturn,
            clearCheckoutState: String(clearCheckoutState),
            parseMetadataModifications: String(parseMetadataModifications),
        };

        if (Filedata) form.Filedata = Filedata;
        if (metadata) form.metadata = JSON.stringify(metadata);

        return this.post('/services/update', form);
    }

    public async updateBulk(q: string, metadata: object): Promise<ProcessResponse> {
        const form = {
            q,
            metadata: JSON.stringify(metadata),
        };

        return this.post('/services/updatebulk', form);
    }

    public async remove(
        q: string | null = null,
        ids: string[] | null = null,
        folderPath: string | null = null,
        asyncFlag: boolean = false
    ): Promise<ProcessResponse> {
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
    ): Promise<unknown> {
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
    ): Promise<unknown> {
        const form: Record<string, any> = {
            to,
            subject,
        };

        if (body) form.body = body;
        if (htmlBody) form.htmlBody = htmlBody;
        return this.post('/services/notify/email', form, true);
    }

    public async removeRelation(relationIds: string[]): Promise<ProcessResponse> {
        return this.post('/services/removeRelation', {
            relationIds: relationIds.toString(),
        });
    }

    public async removeFromCollection(
        childIds: string[],
        collectionId: string
    ): Promise<unknown> {
        return this.post('/services/collection/remove', {
            childIds: childIds.toString(),
            collectionId,
        });
    }

    public async addToCollection(
        childIds: string[],
        collectionId: string
    ): Promise<unknown> {
        return this.post('/services/collection/add', {
            childIds: childIds.toString(),
            collectionId,
        });
    }

    public async getMetadataReport(q: string, format: string = 'csv'): Promise<string> {
        this.ensureTmpDir();
        const filePath = tmp.tmpNameSync({dir: this.tmpDir!.name});

        try {
            await this.download(`/metadata/<reportname>.${format}?q=${q}`, filePath);
            return filePath;
        } catch (err) {
            throw err;
        }
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
