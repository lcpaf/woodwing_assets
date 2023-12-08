import Promise = require("bluebird");
import {AssetsServerBase} from "./AssetsServerBase";
import {PathLike, ReadStream} from 'fs';
import tmp = require('tmp');

export class AssetsServer extends AssetsServerBase {

    private tmpDir: tmp.DirResult | null = null;

    public search = (
        q: string,
        start: number = 0,
        num: number = 50,
        sort: string = 'assetCreated-desc',
        metadataToReturn: string = 'all',
        facets: null | string = null,
        format: string = 'json',
        appendRequestSecret: boolean = false,
        returnHighlightedText: boolean = true
    ): Promise<unknown> => {
        return this.get('/services/search', {
            q,
            start,
            num,
            sort,
            metadataToReturn,
            facets,
            format,
            appendRequestSecret: appendRequestSecret.toString(),
            returnHighlightedText: returnHighlightedText.toString(),
        });
    };

    public browse = (
        path: string,
        fromRoot: null | string = null,
        includeFolders: boolean = true,
        includeAssets: boolean = true,
        includeExtensions: null | string = null,
    ): Promise<unknown> => {

        const form: { [k: string]: any } = {
            path,
            includeFolders: includeFolders.toString(),
            includeAssets: includeAssets.toString(),
        };

        if (null !== fromRoot) {
            form.fromRoot = fromRoot;
        }
        if (null !== includeExtensions) {
            form.includeExtensions = includeExtensions;
        }

        return this.get('/services/browse', form);
    };

    public move = (
        source: string,
        target: string,
        folderReplacePolicy: string = this.FOLDER_REPLACE_POLICY_AUTO_RENAME,
        fileReplacePolicy: string = this.FILE_REPLACE_POLICY_AUTO_RENAME,
        filterQuery: string = '',
        flattenFolders: boolean = false,
        async: boolean = false
    ): Promise<unknown> => {
        return this.post('/services/move', {
            source,
            target,
            folderReplacePolicy,
            fileReplacePolicy,
            filterQuery,
            flattenFolders: flattenFolders.toString(),
            async: async.toString()
        });
    };

    public update = (
        id: string,
        Filedata: ReadStream | null = null,
        metadata: object | null = null,
        metadataToReturn: string = 'all',
        clearCheckoutState: boolean = true,
        parseMetadataModifications: boolean = true,
    ): Promise<unknown> => {
        const form: { [k: string]: any } = {
            id,
            metadataToReturn,
            clearCheckoutState: clearCheckoutState.toString(),
            parseMetadataModifications: parseMetadataModifications.toString(),
        };

        if (null !== Filedata) {
            form.Filedata = Filedata;
        }

        if (null !== metadata) {
            form.metadata = JSON.stringify(metadata);
        }

        return this.post('/services/update', form);
    };

    public updateBulk = (
        q: string,
        metadata: object
    ): Promise<unknown> => {
        const form: { [k: string]: any } = {
            q,
            metadata: JSON.stringify(metadata)
        };
        return this.post('/services/updatebulk', form);
    };

    public remove = (
        q: string | null = null,
        ids: string[] | null = null,
        folderPath: string | null = null,
        async: boolean = false
    ): Promise<unknown> => {
        const form: { [k: string]: any } = {};
        if (null !== q) {
            form.q = q;
        }
        if (null !== ids) {
            form.ids = ids.join(',');
        }
        if (null !== folderPath) {
            form.folderPath = folderPath;
        }
        form.async = async.toString();
        return this.post('/services/remove', form);
    }

    public create = (
        Filedata: ReadStream | null = null,
        metadata: object | null = null,
        metadataToReturn: string = 'all',
    ): Promise<unknown> => {
        const form: { [k: string]: any } = {metadataToReturn};
        if (null !== Filedata) {
            form.Filedata = Filedata;
        }
        if (null !== metadata) {
            form.metadata = JSON.stringify(metadata);
        }
        return this.post('/services/create', form);
    };

    public createFolder = (
        path: string
    ): Promise<unknown> => {
        return this.post('/services/createFolder', {
            path
        });
    };

    public createRelation = (
        relationType: string,
        target1Id: string,
        target2Id: string,
    ): Promise<unknown> => {
        return this.post('/services/createRelation', {
            relationType,
            target1Id,
            target2Id
        });
    };

    public removeRelation = (
        relationIds: string[],
    ): Promise<unknown> => {
        return this.post('/services/removeRelation', {
            relationIds: relationIds.toString(),
        });
    };

    public removeFromCollection = (
        childIds: string[],
        collectionId: string,
    ): Promise<unknown> => {
        return this.post('/services/collection/remove', {
            childIds: childIds.toString(),
            collectionId,
        });
    };

    public getMetadataReport = (
        q: string,
        format: string = 'csv'
    ): Promise<unknown> => {
        const _this = this;

        return new Promise((resolve, reject) => {
            if (!this.tmpDir) {
                this.tmpDir = tmp.dirSync();
            }
            const path = tmp.tmpNameSync({dir: this.tmpDir.name});

            return _this.download(`/metadata/<reportname>.${format}?q=${q}`, path).then(file => {
                resolve(file);
            }).catch(err2 => {
                reject(err2);
            })
        });
    };

    public downloadFromId = (
        assetId: string,
        assetName: string | null = null
    ): Promise<unknown> => {
        const _this = this;

        return new Promise((resolve, reject) => {
            if (!this.tmpDir) {
                this.tmpDir = tmp.dirSync();
            }
            const path = tmp.tmpNameSync({dir: this.tmpDir.name});

            return _this.download(`/file/${assetId}/*/${assetName ?? assetId}?forceDownload=true`, path).then(file => {
                resolve(file);
            }).catch(err2 => {
                reject(err2);
            })
        });
    }

    public downloadPreviewFromId = (
        assetId: string,
        assetName: string | null = null
    ): Promise<unknown> => {
        const _this = this;

        return new Promise((resolve, reject) => {
            if (!this.tmpDir) {
                this.tmpDir = tmp.dirSync();
            }
            const path = tmp.tmpNameSync({dir: this.tmpDir.name});

            return _this.download(`/preview/${assetId}/*/${assetName ?? assetId}.jpg?forceDownload=true`, path).then(file => {
                resolve(file);
            }).catch(err2 => {
                reject(err2);
            })
        });
    }
}
