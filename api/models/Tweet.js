/**
 * @param createdAt
 * @param text
 * @param userId
 * @constructor
 */
exports.Tweet = function(createdAt, text, userId) {
    this.createdAt = createdAt;
    this.text = text;
    this.userId = userId;
};