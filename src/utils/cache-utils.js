'use strict';

const redis = require('redis');
const { promisify } = require('util');

const { RDS_HOST, RDS_PORT } = require('../config');

const client = redis.createClient({
  host: RDS_HOST,
  port: RDS_PORT
});

// Client Promises
const setKey = promisify(client.set).bind(client);
const getKey = promisify(client.get).bind(client);
const deleteKey = promisify(client.del).bind(client);
const getAllKeys = promisify(client.keys).bind(client);

// Question cache fns
async function setQuestionCache(threeWords, data) {
  threeWords = threeWords.split('-').join('');
  let key = `QuestionCache:${threeWords}`;
  await setKey(key, JSON.stringify(data));
  return key;
}

async function getQuestionCache(threeWords) {
  threeWords = threeWords.split('-').join('');
  let key = `QuestionCache:${threeWords}`;
  return JSON.parse(await getKey(key));
}

async function deleteQuestionCache(threeWords) {
  threeWords = threeWords.split('-').join('');
  let key = `QuestionCache:${threeWords}`;
  await deleteKey(key);
  return true;
}

// Response cache fns
async function setResponseCache(threeWords, username, data) {
  threeWords = threeWords.split('-').join('');
  let key = `ResponseCache:${threeWords}:${username}`;
  await setKey(key, JSON.stringify(data));
  return key;
}

async function getResponseCache(threeWords, username) {
  threeWords = threeWords.split('-').join('');
  let key = `ResponseCache:${threeWords}:${username}`;
  return JSON.parse(await getKey(key));
}

async function deleteResponseCache(threeWords, username = null) {
  threeWords = threeWords.split('-').join('');
  let key = username
    ? `ResponseCache:${threeWords}:${username}`
    : `ResponseCache_${threeWords}_*`;
  return await deleteKey(key);
}

// Common fns
async function isValid(key) {
  let data = JSON.parse(await getKey(key));
  if (
    data &&
    data.expiry_timestamp &&
    data.expiry_timestamp > new Date().getTime()
  ) {
    return true;
  }
  return false;
}

module.exports = {
  setQuestionCache,
  getQuestionCache,
  deleteQuestionCache,
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
