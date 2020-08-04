import {AssetsServer} from '../index';

let assetsServer = new AssetsServer({
    downloadUrlFilenameSeparator: "/*/",
    password: 'ww',
    rejectUnauthorized: false,
    serverUrl: "http://localhost:9090",
    username: 'api'
})

test('Assets Search', () => {

    assetsServer.get('/services/search',{
        q: '*'
    }).then(function (result:any) {
        expect(result.maxResultHits).toBe(50);
    }).catch(function (err) {
        fail(err);
    })
});