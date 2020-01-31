var RssController = require('../controllers/rssController.js');
var baseResponse = require('../util/baseResponse.js');

module.exports = function (router) {
    'use strict';

    router.route('/parse')
      .get(function (req, res, next) {
        new RssController().parseRssUrl(req.query["url"], baseResponse(res, next));
      });

    router.route('/search')
      .get(function (req, res, next) {
        new RssController().searchRss(req.query["term"], baseResponse(res, next));
      });
  };