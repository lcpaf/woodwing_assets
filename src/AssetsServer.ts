import Promise = require("bluebird");
import {AssetsServerBase} from "./AssetsServerBase";
import {ReadStream} from 'fs';
import tmp = require('tmp');

export class AssetsServer extends AssetsServerBase {

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
        Filedata: ReadStream,
        metadata: object,
        metadataToReturn: string = 'all'
    ): Promise<unknown> => {
        return this.post('/services/create', {
            Filedata,
            metadata: JSON.stringify(metadata),
            metadataToReturn
        });
    };

    public downloadFromId = (
        assetId: string,
        assetName: string | null = null
    ): Promise<unknown> => {
        const _this = this;

        return new Promise((resolve, reject) => {
            tmp.file(
                (err: any, path: string, fd: any) => {
                    if (err) {
                        return reject(err);
                    }

                    return _this.download(`/file/${assetId}/*/${assetName ?? assetId}?&forceDownload=true`, path).then(file => {
                        resolve(file);
                    }).catch(err2 => {
                        reject(err2);
                    })
                });
        });
    }
}