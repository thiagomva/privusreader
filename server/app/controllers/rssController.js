var Rss = require('../models/rss.js');
var Error = require('../util/error.js');

class RssController {
    constructor() {}

    parseRssUrl(url, cb) {
        if (!url) throw new Error(400, 'url is mandatory');
        Rss.parseRssUrl(url, cb);
    }

    searchRss(term, cb) {
        if (!term) throw new Error(400, 'term is mandatory');
        Rss.searchRss(term, cb);
    }
}
module.exports = RssController;