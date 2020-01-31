import axios from 'axios';
import { server_api } from './constants';

export default class ServerManager {

    static parseRss(url) {
        return new Promise(function (resolve, reject) {
            ServerManager._getFromServer(`v1/rss/parse?url=${encodeURIComponent(url)}`)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    };

    static searchRss(term) {
        return new Promise(function (resolve, reject) {
            ServerManager._getFromServer(`v1/rss/search?term=${encodeURIComponent(term)}`)
            .then(res => resolve(res))
            .catch(err => reject(err));
        });
    };

    static _getFromServer(route) {
        return new Promise(function (resolve, reject) {
            axios.get(server_api + "/" + route)
            .then(res => {
                if (res) {
                    res = res.data;
                }
                resolve(res)
            })
            .catch(err => reject(err));
        });
    };
}
