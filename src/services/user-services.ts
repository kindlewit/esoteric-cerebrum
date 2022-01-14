'use strict';

import db from '../orm';
import omit from 'lodash.omit';
import cloneDeep from 'lodash.clonedeep';

export interface User {
  username: string;
  password: string;
  email: string;
  display_name?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

function sanitize(doc: User): User {
  let cleanObj = cloneDeep(doc);
  for (let [key, value] of Object.entries(doc)) {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === {} ||
      key === 'created_at'
    ) {
      // Cannot insert user-defined created_at nor can it be altered
      omit(cleanObj, key);
    }
  }
  return cleanObj;
}

export const create = function (doc: User): Promise<User | unknown> {
  return new Promise((resolve, reject) => {
    let cleanDoc = sanitize(doc);
    db.user
      .create(cleanDoc)
      .then(() =>
        db.user.findByPk(cleanDoc.username, {
          attributes: {
            exclude: ['password']
          },
          raw: true
        })
      )
      .then((record: User) => resolve(record))
      .catch((e: unknown) => reject(e));
  });
}

export const list = function (
  limit: number | null = null,
  offset: number | null = null
): Promise<unknown> {
  let query = {
    offset,
    limit,
    order: [['created_at', 'DESC']],
    attributes: {
      exclude: ['password']
    },
    raw: false,
    plain: true,
    nest: true
  };
  return db.user.findAndCountAll(query);
}

export const find = function (query: object): Promise<unknown> {
  return db.user.findAll(query);
}

export const get = function (
  username: string,
  includePass: boolean = false
): Promise<User | unknown> {
  return new Promise((resolve, reject) => {
    let query = includePass
      ? { raw: true }
      : {
        attributes: {
          exclude: ['password']
        },
        raw: true
      };
    db.user
      .findByPk(username, query)
      .then((doc: User) => resolve(doc))
      .catch((e: unknown) => reject(e));
  });
}

export const update = function (
  username: string,
  changes: User
): Promise<User | unknown> {
  return new Promise((resolve, reject) => {
    changes = sanitize(changes);
    db.user
      .update(changes, {
        where: { username }
      })
      .then(() =>
        db.user.findByPk(username, {
          attributes: {
            exclude: ['password']
          },
          raw: true
        })
      )
      .then((doc: User) => resolve(doc))
      .catch((e: unknown) => reject(e));
  });
}

export const remove = function (username: string): Promise<unknown> {
  return db.user.destroy({ where: { username } });
}

export { sanitize };
