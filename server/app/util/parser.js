let Parser = require('rss-parser');
let rssParser = null;

exports.start = function(done) {
    if (rssParser) return done();
    rssParser = new Parser({ defaultRSS: 2.0, maxRedirects: 10 });
}

exports.instance = function() {
    return rssParser;
}