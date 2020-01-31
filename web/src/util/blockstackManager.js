import {  
    getFile,
    putFile,
    listFiles,
    deleteFile,
    lookupProfile,
    Person,
    UserSession
} from 'blockstack';
import { appConfig } from './constants';
import uuidv4 from 'uuid/v4';

const readFileName = "read.json";
const favoritedFileName = "favorites.json";
const categoriesFileName = "categories.json";
const sourcesFileName = "sources.json";

export default class BlockstackManager {
    static deleteAll() {
        listFiles((file) => {
            deleteFile(file); 
            return true;
        });
    };

    static isLogged() {
        const userSession = new UserSession({ appConfig });
        return userSession && userSession.isUserSignedIn();
    };

    static getUserProfile (username) {
        return new Promise(function (resolve, reject) {
            lookupProfile(username).then((profile) => 
            {
                if (profile) {
                    var person = new Person(profile);
                    var name = person.name();
                    var avatarUrl = person.avatarUrl();
                    if (avatarUrl) {
                        fetch(avatarUrl).then((response) =>
                        {
                            response.arrayBuffer().then((buffer) =>
                            {
                                resolve({ username: username, name: name, avatarUrl: URL.createObjectURL(new Blob([new Uint8Array(buffer)], {type: "image"})) });
                            })
                            .catch((err) =>
                            {
                                console.error(err);
                                resolve({ username: username, name: name, avatarUrl: null });
                            });
                        })
                        .catch((err) =>
                        {
                            console.error(err);
                            resolve({ username: username, name: name, avatarUrl: null });
                        });
                    } else {
                        resolve({ username: username, name: name, avatarUrl: null });
                    }
                } else {
                    resolve(null);
                }
            }).catch((err) => reject(err));
        });
    };

    static listCategories () {
        return BlockstackManager._get(categoriesFileName);
    };

    static listSources () {
        return BlockstackManager._get(sourcesFileName);
    };

    static listFavorites () {
        return BlockstackManager._get(favoritedFileName);
    };

    static listRead () {
        return BlockstackManager._get(readFileName);
    };

    static setSource (title, feedId, categoryIds, sources, iconUrl = null) {
        return new Promise(function (resolve, reject) {
            sources[feedId] = {
                feedId: feedId,
                updateAt: (new Date()).getTime(),
                title: title,
                iconUrl: iconUrl,
                categories: categoryIds
            };
            BlockstackManager._put(sourcesFileName, sources).then(() => resolve(sources)).catch((err) => reject(err));
        });
    };

    static setSourceCategories (feedId, categoryIds, sources) {
        return new Promise(function (resolve, reject) {
            if (sources[feedId]) {
                sources[feedId].updateAt = (new Date()).getTime();
                for (var i = 0; i < categoryIds.length; ++i) {
                    var found = false;
                    for (var j = 0; j < sources[feedId].categories.length; ++j) {
                        if (categoryIds[i] === sources[feedId].categories[j]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) sources[feedId].categories.push(categoryIds[i]);
                }
                BlockstackManager._put(sourcesFileName, sources).then(() => resolve(sources)).catch((err) => reject(err));
            } else {
                resolve(sources);
            }
        });
    };

    static removeCategoryFromSource(feedId, categoryId, sources) {
        return new Promise(function (resolve, reject) {
            if (sources[feedId]) {
                sources[feedId].updateAt = (new Date()).getTime();
                var categoryIndex = sources[feedId].categories.indexOf(categoryId);
                if (categoryIndex > -1) {
                    sources[feedId].categories.splice(categoryIndex, 1);
                }
                if (sources[feedId].categories.length === 0) {
                    delete sources[feedId];
                }
                BlockstackManager._put(sourcesFileName, sources).then(() => resolve(sources)).catch((err) => reject(err));
            } else {
                resolve(sources);
            }
        });
    };

    static renameSource (title, feedId, sources) {
        return new Promise(function (resolve, reject) {
            if (sources[feedId]) {
                sources[feedId].title = title;
                sources[feedId].updateAt = (new Date()).getTime();
                BlockstackManager._put(sourcesFileName, sources).then(() => resolve(sources)).catch((err) => reject(err));
            } else {
                resolve(sources);
            }
        });
    };

    static deleteSource (feedId, sources) {
        return new Promise(function (resolve, reject) {
            delete sources[feedId];
            BlockstackManager._put(sourcesFileName, sources).then(() => resolve(sources)).catch((err) => reject(err));
        });
    };

    static setCategory (name, categories, id = null) {
        return new Promise(function (resolve, reject) {
            if (!id) id = uuidv4();
            categories[id] = {
                id: id,
                updateAt: (new Date()).getTime(),
                name: name
            };
            BlockstackManager._put(categoriesFileName, categories).then(() => resolve({categories: categories, id: id})).catch((err) => reject(err));
        });
    };

    static deleteCategory (id, categories, sources) {
        return new Promise(function (resolve, reject) {
            if (id) {
                for (var feedId in sources) {
                    for (var i = 0; i < sources[feedId].categories.length; ++i) {
                        if (sources[feedId].categories[i] === id) {
                            sources[feedId].categories.splice(i, 1);
                            break;
                        }
                    }
                    if (sources[feedId].categories.length === 0) delete sources[feedId];
                }
                delete categories[id];
                Promise.all([
                    BlockstackManager._put(categoriesFileName, categories), 
                    BlockstackManager._put(sourcesFileName, sources)
                ]).then(() => resolve([categories, sources])).catch((err) => reject(err));
            } else {
                resolve([categories, sources]);
            }
        });
    };

    static setFavorite (itemData, sourceUrl, favorites) {
        return new Promise(function (resolve, reject) {
            if (itemData && itemData.link && sourceUrl) {
                favorites[itemData.link] = {
                    updateAt: (new Date()).getTime(),
                    sourceUrl: sourceUrl,
                    data: itemData
                };
                BlockstackManager._put(favoritedFileName, favorites).then(() => resolve(favorites)).catch((err) => reject(err));
            } else {
                resolve(favorites);
            }
        });
    };

    static removeFavorite (link, favorites) {
        return new Promise(function (resolve, reject) {
            if (link) {
                delete favorites[link];
                BlockstackManager._put(favoritedFileName, favorites).then(() => resolve(favorites)).catch((err) => reject(err));
            } else {
                resolve(favorites);
            }
        });
    };

    static setRead (links, read) {
        return new Promise(function (resolve, reject) {
            if (links && links.length) {
                var now = (new Date()).getTime();
                for (var i = 0; i < links.length; ++i) {
                    read[links[i]] = now;
                }
                BlockstackManager._put(readFileName, read).then(() => resolve(read)).catch((err) => reject(err));
            } else {
                resolve(read);
            }
        });
    };

    static setUnread (links, read) {
        return new Promise(function (resolve, reject) {
            if (links && links.length) {
                for (var i = 0; i < links.length; ++i) {
                    delete read[links[i]];
                }
                BlockstackManager._put(readFileName, read).then(() => resolve(read)).catch((err) => reject(err));
            } else {
                resolve(read);
            }
        });
    };

    static _put (fileName, jsonData) {
        return new Promise(function (resolve, reject) {
            putFile(fileName, JSON.stringify(jsonData)).then(() => resolve()).catch((err) => reject(err));
        });
    };

    static _get (fileName) {
        return new Promise(function (resolve, reject) {
            if (BlockstackManager.isLogged()) {
                getFile(fileName).then((file) => 
                {
                    if (file) {
                        resolve(JSON.parse(file));
                    } else {
                        resolve({});
                    }
                }).catch((err) => reject(err));
            } else {
                resolve({});
            }
        });
    };
}
