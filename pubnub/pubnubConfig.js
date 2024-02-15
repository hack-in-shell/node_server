// pubnubConfig.js
const PubNub = require('pubnub');
require("dotenv").config();
const crypto = require('crypto');
const uuid = crypto.randomUUID();


const pubnub = new PubNub({
  publishKey: process.env.PUBNUB_PUBLISH_KEY,
  subscribeKey: process.env.PUBNUB_SUBSCRIBE_KEY,
  uuid: process.env.PUBNUB_UUID,
});

module.exports = pubnub;
