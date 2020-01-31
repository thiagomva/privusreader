var axios = require('axios');
var HTMLParser = require('node-html-parser');
const rssCache = require("../util/cache");
const rssParser = require("../util/parser");

class Rss {
    constructor() {
    }
    
    static parseRssUrl(url, cb) {
        if (url.startsWith("feed/")) {
            url = url.substring(5);
        }
        url = url.toLowerCase();
        var rssData = rssCache.instance().get("cf" + url);
        if (rssData) {
            cb(null, rssData);
        } else {
            this.parseRss(url, cb);
        }
    }

    static parseRss(url, cb, attempt = 1) {
        rssParser.instance().parseURL(url, (err, feed) => 
        {
            if (err) {
                if (attempt > 2 || (err && err.message && (err.message.indexOf("Too many") >= 0 || err.message.indexOf("404") >= 0  || err.message.indexOf("403") >= 0))) {
                    if (err.message.indexOf("404") >= 0 && url.endsWith("feeds/posts/default")) {
                        this.parseRss(url.substring(0, url.length - 15), cb);
                    } else {
                        cb(err);
                    }
                } else if (err && err.message && !err.message.startsWith("Status") && !err.message.startsWith("Request")) {
                    axios.get(url).then((res) =>
                    {
                        if (!res.status || res.status >= 300 || !res.headers || !res.data || 
                            !res.headers["content-type"] || res.headers["content-type"].toLowerCase().indexOf("html") < 0) {
                            cb(err);
                        } else {
                            try {
                                var urlLinks = HTMLParser.parse(res.data).querySelector("head").querySelectorAll("link");
                                var rssUrl = null;
                                for (var i = 0; i < urlLinks.length; ++i) {
                                    rssUrl = this.getContent(urlLinks[i].rawAttrs, "type", "application/rss+xml", "href");
                                    if (!!rssUrl) break;
                                }
                                if (rssUrl) {
                                    this.parseRss(rssUrl, cb);
                                } else {
                                    cb(err);
                                }
                            } catch (error) {
                                console.error(error);
                                cb(err);
                            }
                        }
                    }).catch((error) => cb(error));
                } else {
                    setTimeout(() => this.parseRss(url, cb, ++attempt), 1000);
                }
            } else {
                if (feed && feed.items && feed.items.length) {
                    var promises = [];
                    var itemsAdded = {};
                    var itemsResult = [];
                    var origin = this.getUrlOrigin(url);
                    promises.push(axios.get(origin));
                    for (var i = 0; i < feed.items.length; ++i) {
                        if (feed.items[i].link && feed.items[i].link.length > 0 && !itemsAdded[feed.items[i].link]) {
                            itemsAdded[feed.items[i].link] = true;
                            feed.items[i].link = this.getValidLink(origin, feed.items[i].link);
                            itemsResult.push(feed.items[i]);
                            promises.push(axios.get(feed.items[i].link));
                        }
                    }
                    Promise.all(promises.map(p => p.catch(e => e))).then((results) =>
                    {
                        for (var j = 0; j < results.length; ++j) {
                            if (!(results[j] instanceof Error) && results[j].data) {
                                var head = null;
                                try {
                                    head = HTMLParser.parse(results[j].data).querySelector("head");
                                } catch (error) {
                                    console.error(error);
                                    continue;
                                }
                                if (!head) continue;
                                var metadata = head.querySelectorAll("meta");
                                var image = null;
                                var description = null;
                                if (j === 0) {
                                    if (!feed.link) {
                                        feed.link = origin;
                                    }
                                    for (var k = 0; k < metadata.length; ++k) {
                                        if (!image) {
                                            image = this.getContent(metadata[k].rawAttrs, "property", "og:image", "content");
                                            if (!!image) continue;
                                        }
                                        if (!description) {
                                            description = this.getContent(metadata[k].rawAttrs, "property", "og:description", "content");
                                            if (!!description) continue;
                                        }
                                        if (!feed.title) {
                                            feed.title = this.getContent(metadata[k].rawAttrs, "property", "og:title", "content");
                                        }
                                        if (!!image && !!description && !!feed.title) {
                                            break;
                                        }
                                    }
                                    var shortcutIcon = null;
                                    var icon = null;
                                    var links = head.querySelectorAll("link");
                                    for (var w = 0; w < links.length; ++w) {
                                        if (!shortcutIcon) {
                                            shortcutIcon = this.getContent(links[w].rawAttrs, "rel", "shortcut icon", "href");
                                            if (!!shortcutIcon) {
                                                shortcutIcon = this.getValidLink(origin, shortcutIcon);
                                                break;
                                            }
                                        }
                                        if (!icon) {
                                            icon = this.getContent(links[w].rawAttrs, "rel", "icon", "href");
                                            if (!!icon) icon = this.getValidLink(origin, icon);
                                        }
                                    }
                                    feed.visualUrl = image;
                                    feed.iconUrl = shortcutIcon || icon;
                                    feed.description = description;
                                } else {
                                    var twitterImage = null;
                                    var siteUrl = null;
                                    for (var k = 0; k < metadata.length; ++k) {
                                        if (!image) {
                                            image = this.getContent(metadata[k].rawAttrs, "property", "og:image", "content");
                                            if (!!image) continue;
                                        }
                                        if (!image && !twitterImage) {
                                            twitterImage = this.getContent(metadata[k].rawAttrs, "name", "twitter:image", "content");
                                            if (!!twitterImage) continue;
                                        }
                                        if (!description) {
                                            description = this.getContent(metadata[k].rawAttrs, "property", "og:description", "content");
                                            if (!!description) continue;
                                        }
                                        if (!siteUrl) {
                                            siteUrl = this.getContent(metadata[k].rawAttrs, "property", "og:url", "content");
                                            if (!!siteUrl) continue;
                                        }
                                        if (!itemsResult[j - 1].title) {
                                            itemsResult[j - 1].title = this.getContent(metadata[k].rawAttrs, "property", "og:title", "content");
                                        }
                                        if (!!image && !!description && !!siteUrl && !!itemsResult[j - 1].title) {
                                            break;
                                        }
                                    }
                                    if (!siteUrl) {
                                        var links = head.querySelectorAll("link");
                                        for (var w = 0; w < links.length; ++w) {
                                            siteUrl = this.getContent(links[w].rawAttrs, "rel", "canonical", "href");
                                            if (!!siteUrl) break;
                                        }
                                    }
                                    itemsResult[j - 1].url = siteUrl || itemsResult[j - 1].link;
                                    itemsResult[j - 1].image = image || twitterImage;
                                    itemsResult[j - 1].description = description;
                                }
                            }
                        }
                        feed.items = itemsResult;
                        rssCache.instance().set("cf" + url, feed, 900);
                        cb(null, feed);
                    });
                } else {
                    cb(null, feed);
                }
            }
        });
    }

    static getValidLink (origin, link) {
        if (link.length > 0 && !link.toLowerCase().startsWith("http")) {
            if (link[0] === '/') {
                link = origin + link;
            } else {
                link = origin + "/" + link;
            }
        }
        return link;
    }

    static getContent (raw, searchTag, searchValue, tagWithValue) {
        var searchValueIndex = null;
        if ((searchValueIndex = raw.indexOf(searchValue)) >= 0 && raw.length > (searchValueIndex + searchValue.length) &&
            (raw[searchValueIndex + searchValue.length] === '"' ||
             raw[searchValueIndex + searchValue.length] === '\'' ||
             raw[searchValueIndex + searchValue.length] === ' ')) {
            return this.getValidResult(raw, searchValueIndex, searchTag, tagWithValue);
        }
        return null;
    }

    static getValidResult (raw, searchValueIndex, searchTag, tagWithValue, startSearchTag = 0) {
        var searchTagIndex = null;
        if ((searchTagIndex = raw.indexOf(searchTag, startSearchTag)) >= 0) {
            if ((searchTagIndex + searchTag.length + 2) >= searchValueIndex) {
                var valueIndex = null;
                var result = null;
                if ((valueIndex = raw.indexOf(tagWithValue + "=")) >= 0) {
                    if (valueIndex > searchTagIndex) {
                        result = raw.substring(valueIndex + tagWithValue.length + 2, raw.length - 1);
                    } else {
                        result = raw.substring(valueIndex + tagWithValue.length + 2, searchTagIndex - 2);
                    }
                    while (result[result.length - 1] === ' ' || result[result.length - 1] === '"' || result[result.length - 1] === '\'') {
                        result = result.substring(0, result.length - 1);
                    }
                }
                return result;
            } else {
                return this.getValidResult(raw, searchValueIndex, searchTag, tagWithValue, searchTagIndex + searchTag.length);
            }
        }
    }

    static getUrlOrigin (url) {
        var data = url.split('/');
        return data.length > 2 ? data[0] + "//" + data[2] : url;
    }

    static searchRss(term, cb) {
        var result = rssCache.instance().get("cs" + term.toLowerCase());
        if (result) {
            cb(null, result);
        } else {
            axios.get(`https://cloud.feedly.com/v3/search/feeds?query=${encodeURIComponent(term)}&count=20`)
            .then((response) => 
            {
                if (response && response.data && response.data.results) {
                    rssCache.instance().set("cs" + term.toLowerCase(), response.data.results, 6000);
                    cb(null, response.data.results);
                } else {
                    cb(null, []);
                }
            }).catch((err) => cb(err));
        }
    }
}

module.exports = Rss;