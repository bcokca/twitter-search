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

/**
 *
 * @param keyword
 * @param from
 * @param size
 * @param callback
 */
exports.searchHandler = function (keyword, from, size, callback) {
    const tweets = [];
    const scoreMap = {};

    readTweets(function (err, array) {
        if (err) callback(err, null);
        var index = 0;
        array.forEach(function (item) {
            if (item.length > DATE_LENGTH + TWEET_TEXT_LENGTH + 1) {
                var tweet = resolveTweet(item);
                if (!keyword) {
                    tweets.push(tweet);
                } else {
                    var score = getRelevanceScore(keyword, tweet);
                    if (score > 0) {
                        scoreMap[index++] = score;
                        tweets.push(tweet);
                    }
                }
            }
        });
        sortByRelevance(tweets, scoreMap);
        callback(null, tweets.slice(from, size));
    });
};

//this method is almost identical with searchMention function but there might be some distinct extra work for hashtag and
//mention features. So its better to keep them in separate functions
exports.searchHashTag = function (keyword, from, size, callback) {
    const tweets = [];
    readTweets(function (err, array) {
        if (err) callback(err, null);
        array.forEach(function (tweet) {
            if (tweet.length > DATE_LENGTH + TWEET_TEXT_LENGTH + 1) {
                var _tweet = resolveTweet(tweet);
                if (_tweet.text.indexOf('#' + keyword) > -1) {
                    tweets.push(_tweet);
                }
            }
        });

        callback(null, tweets.slice(from, size));
    });

};

exports.searchMention = function (keyword, from, size, callback) {
    const tweets = [];
    readTweets(function (err, array) {
        if (err) callback(err, null);
        array.forEach(function (tweet) {
            if (tweet.length > DATE_LENGTH + TWEET_TEXT_LENGTH + 1) {
                var _tweet = resolveTweet(tweet);
                if (_tweet.text.indexOf('@' + keyword) > -1) {
                    tweets.push(_tweet);
                }
            }
        });

        callback(null, tweets.slice(from, size));
    });
};


/**
 * reads the tweets from the tweets.txt file
 * this is a very inefficient way of fetching tweets but for this assignment we will use the .txt file as our database
 * @param callback
 */
function readTweets(callback) {
    try {
        fs.readFile(path.join(__dirname, '/../assets/tweets.txt'), function (err, data) {
            if (err) throw err;

            const array = data.toString().split("\n");
            if (!Array.isArray(array) && array.length < 1) {
                callback(null, []);
            }
            //remove the first two rows(column header and dashes)
            array.splice(0, 2);

            callback(null, array);
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
    var userId = tweet.slice(DATE_LENGTH + TWEET_TEXT_LENGTH + 1).trim();
    return new model.Tweet(createdDate, text, userId);
}