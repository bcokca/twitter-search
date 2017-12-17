const utilityService = require('../functions/utility.service');

/**
 * @param createdAt
 * @param text
 * @param userId
 * @param uuid
 * @constructor
 */
exports.Tweet = function (createdAt, text, userId, uuid) {
    this.createdAt = createdAt;
    this.text = text;
    this.userId = userId;
    this.uuid = uuid || utilityService.guid();
};