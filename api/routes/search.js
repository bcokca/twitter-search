const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const DATE_LENGTH = 20;
const TWEET_TEXT_LENGTH = 140;
const STOP_WORDS = ['a', 'an', 'the', 'in', 'on', 'and', 'of', 'at'];


//todo -- biggest issue is relevance
function Tweet(createdAt, text, userId) {
    this.createdAt = createdAt;
    this.text = text;
    this.userId = userId;
}

/**
 * First search relevance idea
 * how many times the keywords exists in the result
 * search keyword should be separated by words
 *
 * map with a weight is a really good idea
 * then sort by that map
 *
 * also have a list of keywords that you dont want them to effect the search
 * you should still be looking for it
 *
 */
router.get('/', function (req, res, next) {
    var tweets = [];
    var keyword = querystring.escape(req.query['keyword']);
    keyword = keyword.toLowerCase();
    console.log('keyword', keyword);

    const scoreMap = {};

    try {
        fs.readFile(path.join(__dirname, 'tweets.txt'), function (err, data) {
            if (err) throw err;
            var array = data.toString().split("\n");
            var index = 0;
            array.forEach(function (tweet) {
                if (tweet.length > TWEET_TEXT_LENGTH + 1) {
                    var _tweet = resolveTweet(tweet);
                    if (!keyword) {
                        tweets.push(_tweet);
                    } else {
                        var score = getRelevanceScore(keyword, _tweet);
                        if(score > 0){
                            scoreMap[index++] = score;
                            tweets.push(_tweet);
                        }
                    }

                    sortByRelevance(tweets, scoreMap);

                    // else if (tweet.toLowerCase().indexOf(keyword.toLowerCase()) > -1) {
                    //     tweets.push(_tweet);
                    // }
                }
            });
            console.log(scoreMap);
            res.send(tweets.slice(0, 10));
        });
    } catch (exception) {
        res.send(['err']);
        console.log('exception', exception);
    }

});

//100 full keyword
//10 for if the keyword are seen separately
//the stop words 1 for the words we dont want to see like a, the, and,
//if the locale is not english???

function getRelevanceScore(keyword, tweet) {
    //rule1 if the keyword is fully in the text
    var score = 0;
    var text = tweet.text
        .toLowerCase()
        .replace(/\W/g, ''); //more results, should it be part of the relevance algorithm???

    var _keyword = keyword
        .toLowerCase()
        .replace(/\W/g, '');

    if (text.indexOf(_keyword) > -1) {
        score += 100;
    }


    var keywordTokens = keyword.replace('%20', ' ').split(' ');

    keywordTokens.forEach(function (k) {
        if (text.indexOf(k) > -1) {
            if (STOP_WORDS.indexOf(k) > -1) {
                score += 1;
            } else {
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
    if(Array.isArray(list) && list.length > 1){
        list.sort(function (a, b) {
            return scoreMap[list.indexOf(a)] - scoreMap[list.indexOf(b)];
        });
    }
}

function resolveTweet(tweet){
    var createdDate = tweet.slice(0, DATE_LENGTH);
    var text = tweet.slice(DATE_LENGTH, TWEET_TEXT_LENGTH + 1);
    var userId = tweet.slice(TWEET_TEXT_LENGTH + 1);
    return new Tweet(createdDate, text, userId);
}


module.exports = router;
