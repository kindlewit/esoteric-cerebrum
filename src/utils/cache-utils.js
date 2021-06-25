"use strict";

const redis = require('redis');
const { promisify } = require('util');

const { RDS_HOST, RDS_PORT } = require('../../config');

const client = redis.createClient({
  host: RDS_HOST,
  port: RDS_PORT
});

// Client Promises
const setKey = promisify(client.set).bind(client);
const getKey = promisify(client.get).bind(client);
const deleteKey = promisify(client.del).bind(client);
const getAllKeys = promisify(client.keys).bind(client);


// User cache fns
async function setLoginCache(username, data) {
  let key = `UserLoginCache_${username}`;
  await setKey(key, JSON.stringify(data));
  return key;
}

async function getLoginCache(usernameOrKey) {
  if (usernameOrKey.includes('UserLoginCache_')) {
    // Get by Key
    return JSON.parse(await getKey(usernameOrKey));
  } else {
    // Get by username
    let key = `UserLoginCache_${usernameOrKey}`;
    return JSON.parse(await getKey(key));
  }
}

async function deleteLoginCache(usernameOrKey) {
  if (usernameOrKey.includes('UserLoginCache_')) {
    // Delete by Key
    return JSON.parse(await getKey(usernameOrKey));
  } else {
    // Delete by username
    let key = `UserLoginCache_${usernameOrKey}`;
    return await deleteKey(key);
  }
}

async function isValid(key) {
  let data = JSON.parse(await getKey(key));
  if (data.expiry_timestamp && data.expiry_timestamp > new Date().getTime()) {
    return true;
  }
  return false;
}

// Response cache fns
async function setResponseCache(threeWords, username, data) {
  threeWords = threeWords.split('-').join('');
  let key = `ResponseCache_${threeWords}_${username}`;
  await setKey(key, JSON.stringify(data));
  return key;
}

async function getResponseCache(threeWords, username) {
  threeWords = threeWords.split('-').join('');
  let key = `ResponseCache_${threeWords}_${username}`;
  return JSON.parse(await getKey(key));
}

async function deleteResponseCache(threeWords, username = null) {
  threeWords = threeWords.split('-').join('');
  let key = username ? `ResponseCache_${threeWords}_${username}` : `ResponseCache_${threeWords}_*`;
  return await deleteKey(key);
}

module.exports = {
  setLoginCache,
  getLoginCache,
  deleteLoginCache,
  setResponseCache,
  getResponseCache,
  deleteResponseCache,
  isValid,
  setKey,
  getKey,
  deleteKey,
  getAllKeys,
  client
};
