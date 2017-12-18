const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const model = require('../models/Tweet');


const DATE_LENGTH = 20;
const TWEET_TEXT_LENGTH = 140;
//can be many more words too
//the other thing that we should take care of is language support
//but for this assignment lets assume users locals are english and tweets are all in english
const STOP_WORDS = ['a', 'an', 'the', 'in', 'on', 'and', 'of', 'at'];
const cache = {};

/**
 *
 * @param keyword
 * @param from
 * @param size
 * @param callback
 */
exports.searchHandler = function (keyword, from, size, callback) {
    const result = [];
    const scoreMap = {};

    readTweets(function (err, tweets) {
        if (err) callback(err, null);
        if (!keyword) {
            callback(null, {total: tweets.length, list: tweets.slice(from, size)});
            return;
        }

        tweets.forEach(function (tweet) {
            var score = getRelevanceScore(keyword, tweet.text);
            if (score > 0) {
                scoreMap[tweet.uuid] = score;
                result.push(tweet);
            }
        });

        //sort the result with scoreMap
        result.sort(function (a, b) {
            return scoreMap[b.uuid] - scoreMap[a.uuid];
        });

        callback(null, {total: result.length, list: result.slice(from, size)});
    });
};

//this method is almost identical with searchMention function but there might be some distinct extra work for hashtag and
//mention features. So its better to keep them in separate functions
exports.searchHashTag = function (keyword, from, size, callback) {
    const result = [];
    readTweets(function (err, tweets) {
        if (err) callback(err, null);
        tweets.forEach(function (tweet) {
            if (tweet.text.indexOf('#' + keyword) > -1) {
                result.push(tweet);
            }
        });

        callback(null, {total: result.length, list: result.slice(from, size)});
    });

};

exports.searchMention = function (keyword, from, size, callback) {
    const result = [];
    readTweets(function (err, tweets) {
        if (err) callback(err, null);
        tweets.forEach(function (tweet) {
            if (tweet.text.indexOf('@' + keyword) > -1) {
                result.push(tweet);
            }
        });

        callback(null, {total: result.length, list: result.slice(from, size)});
    });
};


/**
 * reads the tweets from the tweets.txt file
 * this is a very inefficient way of fetching tweets but for this assignment we will use the .txt file as our database
 * we can use a more aggressive caching. Instead of waiting for the method to be executed we could cache the tweets
 * in the initialization. With that we would save time for the first call. But again that will also require some cache
 * eviction strategy for data consistency. We need to update the cache or invalidate it when tweets file changed
 * @param callback
 */
function readTweets(callback) {
    if (cache.tweets && cache.tweets.length > 0) {
        callback(null, cache.tweets);
        return;
    }

    try {
        fs.readFile(path.join(__dirname, '/../assets/tweets.txt'), function (err, data) {
            if (err) throw err;
            var tweets = [];

            const array = data.toString().split("\n");
            if (!Array.isArray(array) && array.length < 1) {
                callback(null, []);
            }
            //remove the first two rows(column header and dashes)
            array.splice(0, 2);
            //cache the tweets for next read
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (item.length > DATE_LENGTH + TWEET_TEXT_LENGTH + 1) {
                    tweets.push(resolveTweet(item));
                }
            }
            cache.tweets = tweets;
            callback(null, cache.tweets);
        });
    } catch (exception) {
        callback(exception, null);
        console.log('exception', exception);
    }

}

/**
 * This function tries to use the a score based algorithm to sort the result
 *
 * full keyword 100 points
 * If the keywords are seen separately 10 points
 * STOP WORDS are 1 point // it can even be ignored
 *
 * @param keyword: string
 * @param text : string
 * @returns {number}: score of the provided tweet
 */
function getRelevanceScore(keyword, text) {
    var score = 0;
    text = text
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

//instantiate a tweet instance with text line and return it
function resolveTweet(item) {
    var createdDate = item.slice(0, DATE_LENGTH).trim();
    var text = item.slice(DATE_LENGTH, DATE_LENGTH + TWEET_TEXT_LENGTH + 1).trim();
    var userId = item.slice(DATE_LENGTH + TWEET_TEXT_LENGTH + 1).trim();
    return new model.Tweet(createdDate, text, userId);
}