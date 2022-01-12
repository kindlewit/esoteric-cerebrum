'use strict';

import cloneDeep from 'lodash.clonedeep';
import { compareSync, hash } from 'bcryptjs';
import UserServices from '../services/user-services';
import { ERROR_MESSAGE, PAGE_LIMITS, SALT_LENGTH } from '../config';
import { computePagination, hasAll } from '../utils/misc-utils';

export const cookieValidator = function (request, reply, next) {
  let { session } = request;
  let username = request?.params?.username || request?.body?.username;
  if (session.username) {
    // Cookie authenticated
    if (username && session.username !== username) {
      return reply.code(403).send(); // User not authroized to make this request
    }
    return next();
  }
  return reply.code(401).send(); // Unauthenticated
};

export const signupUser = async function (request, reply) {
  if (
    !request.body ||
    !hasAll(request.body, ['username', 'password', 'email'])
  ) {
    request.log.error('Required parameters missing');
    return reply.code(400).send();
  }
  try {
    let signupObj = cloneDeep(request.body);
    signupObj.password = await hash(signupObj.password, SALT_LENGTH);
    let record = await UserServices.create(signupObj);
    return reply.code(201).send(record);
  } catch (e) {
    request.log.error(e);
    let response = ERROR_MESSAGE.replace('{errorcode}', e?.original?.code);
    return reply.code(500).send(response);
  }
};

export const listUsers = async function (request, reply) {
  try {
    let currentPageNo = request?.query?.page || parseInt(1);
    let { limit, offset } = computePagination(currentPageNo, PAGE_LIMITS.USER);

    let { count, rows } = await UserServices.list(limit, offset);
    let response = {
      total_docs: count,
      docs: rows
    };
    // Compute pagination
    // if (count > PAGE_LIMITS.USER) {
    //   response.next_page = request.url.replace(
    //     /page=\d+/gi,
    //     `page=${parseInt(currentPageNo) + 1}`
    //   );
    // }
    return reply.code(200).send(response);
  } catch (e) {
    request.log.error(e);
    let response = ERROR_MESSAGE.replace('{errorcode}', e?.original?.code);
    return reply.code(500).send(response);
  }
};

export const loginUser = async function (request, reply) {
  if (!request.body || !hasAll(request.body, ['username', 'password'])) {
    request.log.error('Required parameters missing');
    return reply.code(400).send();
  }
  try {
    let { username, password } = request.body;
    let record = await UserServices.get(username, true);
    if (record === undefined || record === null || record === {}) {
      return reply.code(404).send();
    }
    if (await compareSync(password, record.password)) {
      // Password validated
      request.session.username = record.username; // Set cookie
      return reply.code(200).send();
    }
    return await reply.code(401).send();
  } catch (e) {
    request.log.error(e);
    let response = ERROR_MESSAGE.replace('{errorcode}', e?.original?.code);
    return reply.code(500).send(response);
  }
};

export const getUser = async function (request, reply) {
  if (!request.params || !request.params.username) {
    return reply.code(400).send();
  }
  try {
    let { username } = request.params;
    let record = await UserServices.get(username);
    if (record === undefined || record === null || record === {}) {
      return reply.code(404).send();
    }
    // Add user attendance, scores, stats
    return reply.code(200).send(record);
  } catch (e) {
    request.log.error(e);
    let response = ERROR_MESSAGE.replace('{errorcode}', e?.original?.code);
    return reply.code(500).send(response);
  }
};

export const updateUser = async function (request, reply) {
  /**
   * Cookie verification in pre-handler
   */
  if (
    !request.params ||
    !request.params.username ||
    !request.body ||
    request.body === {}
  ) {
    return reply.code(400).send();
  }
  try {
    let { username } = request.params;
    let record = await UserServices.update(username, request.body);
    if (record === undefined || record === null || record === {}) {
      return reply.code(404).send();
    }
    return reply.code(200).send(record);
  } catch (e) {
    request.log.error(e);
    let response = ERROR_MESSAGE.replace('{errorcode}', e?.original?.code);
    return reply.code(500).send(response);
  }
};

export const deleteUser = async function (request, reply) {
  /**
   * Cookie verification in pre-handler
   */
  if (!request.params || !request.params.username) {
    return reply.code(400).send();
  }
  try {
    if (request.query?.purge) {
      // Purge user existance
      // await ResponseServices.remove(request.params.username);
      // await QuizServices.remove(request.params.username);
    }
    await UserServices.remove(request.params.username);
    return reply.code(204).send();
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send();
  }
};
