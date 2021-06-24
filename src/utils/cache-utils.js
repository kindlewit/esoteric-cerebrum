"use strict";

const redis = require('redis');
const { promisify } = require('util');

const { RDS_HOST, RDS_PORT } = require('../../config');

const client = redis.createClient({
  host: RDS_HOST,
  port: RDS_PORT
});

const getCacheKey = promisify(client.get).bind(client);
const setCacheKey = promisify(client.set).bind(client);
const getKeys = promisify(client.keys).bind(client);

async function setUserLoginCache(username, data) {
  let key = `UserLoginCache_${username}`;
  await setCacheKey(key, JSON.stringify(data))
  return key;
}

function getUserLoginCache(username) {
  let key = `UserLoginCache_${username}`;
  return getCacheKey(key);
}

async function setResponseCache(threeWords, username, data) {
  threeWords = threeWords.split('-').join('');
  let key = `ResponseCache_${username}_${threeWords}`;
  await setCacheKey(key, JSON.stringify(data));
  return key;
}

function getResponseCache(threeWords, username) {
  threeWords = threeWords.split('-').join('');
  let key = `ResponseCache_${username}_${threeWords}`;
  return getCacheKey(key);
}

module.exports = {
  setCacheKey,
  getCacheKey,
  getKeys,
  setUserLoginCache,
  getUserLoginCache,
  setResponseCache,
  getResponseCache,
  client
};
