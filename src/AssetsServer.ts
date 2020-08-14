import Promise = require("bluebird");
import {SearchResponse} from "./SearchResponse";
import {AssetsServerBase} from "./AssetsServerBase";

export class AssetsServer extends AssetsServerBase {

    public search = (
        q: string,
        start: number = 0,
        num: number = 50,
        sort: string = 'assetCreated-desc',
        metadataToReturn: string = 'all',
        facets: null | string = null,
        format: string = 'json',
        appendRequestSecret: string = 'false',
        returnHighlightedText: string = 'true'
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
            appendRequestSecret,
            returnHighlightedText
        });
    };

    public move = (
        source: string,
        target: string,
        folderReplacePolicy: string = this.FOLDER_REPLACE_POLICY_AUTO_RENAME,
        fileReplacePolicy: string = this.FILE_REPLACE_POLICY_AUTO_RENAME,
        filterQuery: string = '',
        flattenFolders: string = 'false',
        async: string = 'false'
    ) => {
        return this.post('/services/move', {
            source,
            target,
            folderReplacePolicy,
            fileReplacePolicy,
            filterQuery,
            flattenFolders,
            async
        });
    };

    public update = (
        id: string,
        metadata: object,
        metadataToReturn: string = 'all',
        clearCheckoutState: string = 'true',
        parseMetadataModifications: string = 'true',
    ) => {
        return this.post('/services/update', {
            id,
            metadata: JSON.stringify(metadata),
            metadataToReturn,
            clearCheckoutState,
            parseMetadataModifications,
        });
    };
}