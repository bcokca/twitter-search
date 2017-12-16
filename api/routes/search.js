const express = require('express');
const router = express.Router();
const searchHandler = require('../functions/search.handler');

const cache = {};


router.get('/', function (req, res, next) {
    var keyword = decodeURIComponent(req.query['keyword']);

    //todo lazy loading parameters : out of scope for this assignment
    const size = req.query['size'] || 25;
    const from = req.query['from'] || 0;

    const hashtag = req.query['hashtag'];
    const mention = req.query['mention'];

    //check the cache first for a better performance
    //todo -- we also need a cache eviction strategy here (LRU is a good candidate): out of scope
    //in real life this should come from redis or something
    const cacheKey = generateCacheKey(keyword, size, '', hashtag || mention || '');
    if (cache[cacheKey] && keyword) {
        res.send(cache[cacheKey]);
        return;
    }

    if(hashtag){
        searchHandler.searchHashTag(keyword, from, size, function (err, result) {
            if (err) res.send(err);
            cache[cacheKey] = result;
            res.send(result);
        })
    } else if(mention){
        searchHandler.searchMention(keyword, from, size, function (err, result) {
            if (err) res.send(err);
            res.send(result);
        })
    } else {
        searchHandler.searchHandler(keyword, from, size, function (err, result) {
            if (err) res.send(err);
            res.send(result);
        })
    }

});

/**
 * unique hash key generate to store the result
 * @param keyword
 * @param size
 * @param from
 * @param node
 * @returns {string}
 */
function generateCacheKey(keyword, size, from, node) {
    var _keyword = keyword
        .toLowerCase()
        .replace(/\W/g, '');
    return _keyword + size + from + node;
}

module.exports = router;
