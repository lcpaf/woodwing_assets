import Promise = require("bluebird");
import {SearchResponse} from "./SearchResponse";
import {AssetsServerBase} from "./AssetsServerBase";
import {ReadStream} from 'fs';

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
    ): Promise<SearchResponse> => {
        // @ts-ignore
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
    ) => {
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
        metadata: object,
        metadataToReturn: string = 'all',
        clearCheckoutState: boolean = true,
        parseMetadataModifications: boolean = true,
    ) => {
        return this.post('/services/update', {
            id,
            metadata: JSON.stringify(metadata),
            metadataToReturn,
            clearCheckoutState: clearCheckoutState.toString(),
            parseMetadataModifications: parseMetadataModifications.toString(),
        });
    };

    public create = (
        Filedata: ReadStream,
        metadata: object,
        metadataToReturn: string = 'all'
    ) => {
        return this.post('/services/create', {
            Filedata,
            metadata: JSON.stringify(metadata),
            metadataToReturn
        });
    };

    public download = (
        assetId: string,
        assetName: string | null = null
    ) => {
        return this.get('/file/' + assetId + '/*/' + (assetName ?? assetId) + '?_=1&v=1&forceDownload=true')
    }
}