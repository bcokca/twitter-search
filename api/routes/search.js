const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const model = require('../models/Tweet');

const DATE_LENGTH = 20;
const TWEET_TEXT_LENGTH = 140;
const STOP_WORDS = ['a', 'an', 'the', 'in', 'on', 'and', 'of', 'at'];
const cache = {};


router.get('/', function (req, res, next) {
    const tweets = [];
    const scoreMap = {};
    var keyword = decodeURIComponent(req.query['keyword']);

    // //todo -- implement this
    const size = req.query['size'] || 25;
    // const from = req.query['from'] || 0;
    // const hashtag = req.query['hashtag'];
    // const mention = req.query['mention'];
    // console.log('hashtag', hashtag);
    // console.log('mention', mention);


    //check the cache first for a better performance
    //todo -- we also need a cache eviction strategy here, out of scope
    //in reality this should come from redis or something
    const cacheKey = generateCacheKey(keyword, size, '');
    if (cache[cacheKey] && keyword) {
        res.send(cache[cacheKey]);
        return;
    }

    try {
        fs.readFile(path.join(__dirname, 'tweets.txt'), function (err, data) {
            if (err) throw err;

            const array = data.toString().split("\n");
            if (!Array.isArray(array) && array.length < 1) {
                res.send([]);
            }

            //remove the first two rows(column header and dashes)
            array.splice(0, 2);

            var index = 0;
            array.forEach(function (tweet) {
                if (tweet.length > DATE_LENGTH + TWEET_TEXT_LENGTH + 1) {
                    var _tweet = resolveTweet(tweet);
                    if (!keyword) {
                        tweets.push(_tweet);
                    } else {
                        var score = getRelevanceScore(keyword, _tweet);
                        if (score > 0) {
                            scoreMap[index++] = score;
                            tweets.push(_tweet);
                        }
                    }
                }
            });
            if(scoreMap && scoreMap.length > 0){
                sortByRelevance(tweets, scoreMap);
                cache[cacheKey] = tweets.slice(0, size);
            }

            res.send(tweets.slice(0, size));
        });
    } catch (exception) {
        res.send(['err']);
        console.log('exception', exception);
    }

});

/**
 * This function tries to use the a score based algorithm to sort the result
 *
 * full keyword 100 points
 * If the keyword are seen separately 10 points
 * STOP WORDS are 1 point // it can even be ignored
 *
 * @param keyword: string
 * @param tweet : Tweet
 * @returns {number}: score of the provided tweet
 */
function getRelevanceScore(keyword, tweet) {
    var score = 0;
    var text = tweet.text
        .toLowerCase();
    //.replace(/\W/g, ''); //reduces entropy

    var _keyword = keyword
        .toLowerCase();
    //.replace(/\W/g, '')


    //CASE 1 - keyword is in the text
    if (text.indexOf(_keyword) > -1) {
        score += 100;
    }

    //if the tokens are in the text check if it is a stop word or not
    _keyword.split(' ').forEach(function (k) {
        if (text.indexOf(k) > -1) {
            //CASE 2 - TOKEN IN THE TEXT AND IT IS A STOP WORD
            if (STOP_WORDS.indexOf(k) > -1) {
                score += 1;
            } else {
                //CASE 3 - TOKEN IN THE TEXT AND IT IS NOT A STOP WORD
                score += 10;
            }
        }
    });

    return score;
}

/**
 * sort the given list with the score map
 * @param list: list of
 * @param scoreMap
 */
function sortByRelevance(list, scoreMap) {
    if (Array.isArray(list) && list.length > 1) {
        list.sort(function (a, b) {
            return scoreMap[list.indexOf(b)] - scoreMap[list.indexOf(a)];
        });
    }
}

function resolveTweet(tweet) {
    var createdDate = tweet.slice(0, DATE_LENGTH).trim();
    var text = tweet.slice(DATE_LENGTH, TWEET_TEXT_LENGTH + 1).trim();
    var userId = tweet.slice(TWEET_TEXT_LENGTH + 1).trim();
    return new model.Tweet(createdDate, text, userId);
}

function generateCacheKey(keyword, size, from) {
    var _keyword = keyword
        .toLowerCase()
        .replace(/\W/g, '');
    return _keyword + size + from;
}

module.exports = router;
