'use strict';

import db from '../orm';
import omit from 'lodash.omit';
import cloneDeep from 'lodash.clonedeep';
import { ElasticSearchUtils } from '../utils/elasticsearch-utils';
import { ES_HOST, RESPONSE_MAPPING } from '../config';

const esActor = new ElasticSearchUtils({ node: ES_HOST });
esActor.setIndex('responses', RESPONSE_MAPPING);

interface Response {
  three_words: string;
  username: string;
  number: number;
  text: string | undefined | null;
  choice: Array<string> | undefined | null;
  score: number;
  created_at: Date;
  updated_at: Date;
  _id: string
}

function sanitize(doc: Response) {
  let cleanObj = cloneDeep(doc);
  for (let [key, val] of Object.entries(doc)) {
    if (
      val === undefined ||
      val === null ||
      val === '' ||
      key === 'created_at'
    ) {
      // Cannot insert user-defined created_at nor can it be altered
      omit(cleanObj, key);
    }
  }
  if (doc.number != null && typeof doc.number === 'string') {
    cleanObj.number = parseInt(doc.number);
  }
  if (doc.score != null && typeof doc.score === 'string') {
    cleanObj.score = parseFloat(doc.score);
  }
  return cleanObj;
}

function create(doc: Response): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = sanitize(doc);
    body.created_at = new Date();
    body.updated_at = new Date();
    // body._id = doc.username + ':' + doc.three_words + ':' + doc.number;
    esActor
      .upsert(body)
      .then((res: any) => {
        // if (res?.body?._source) {
        //   resolve(res.body._source);
        // }
        // resolve(true);
        return resolve(res);
      })
      .catch((e: any) => reject(e));
  });
}

function bulkCreate(docs: Array<Response>): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = docs.map(sanitize);
    body = body.map(b => ({
      ...b,
      created_at: new Date(),
      updated_at: new Date()
    }));
    esActor.bulkUpsert(body)
      .then((res: any) => {
        console.info('Succesful bulkCreate');
        return resolve(res.body);
      })
      .catch((e: any) => reject(e));
  });
}

// function list(limit: number | null = null, offset: number | null = null) {
//   return new Promise((resolve, reject) => {
//     esActor.search({})
//       .then((res: any) => {
//         console.log(res);
//         return resolve(res?.body);
//       })
//       .catch((e: any) => reject(e));
//   });
// }

function get(threeWords: string, username: string, qNum: number) {
  return new Promise((resolve, reject) => {
    let id = threeWords + ':' + username + ':' + qNum;
    esActor.get(id)
      .then((res: any) => {
        return res?.body?._source;
      })
      .catch((e: any) => reject(e));
  });
}

function find(query: object) {
  return new Promise((resolve, reject) => {
    esActor.search(query)
      .then((res: any) => {
        console.log(res);
        return resolve(res?.body);
      })
      .catch((e: any) => reject(e));
  });;
}

// function update(threeWords, username, qNum, changes) {
//   if (
//     _.isNil(threeWords) ||
//     _.isNil(username) ||
//     _.isNil(qNum) ||
//     _.isNil(changes)
//   ) {
//     throw Error('Missing parameters');
//   }
//   changes = sanitize(changes);
//   let query = {
//     where: {
//       three_words: threeWords,
//       username,
//       number: qNum
//     },
//     raw: true
//   };
//   return new Promise((resolve, reject) => {
//     db.response
//       .update(changes, query)
//       .then(() => db.response.findOne(query))
//       .then((doc) => resolve(_.cloneDeep(doc)))
//       .catch((e) => reject(e));
//   });
// }

// function remove(threeWords, username, qNum) {
//   if (_.isNil(threeWords) || _.isNil(username) || _.isNil(qNum)) {
//     throw Error('Missing parameters');
//   }
//   return new Promise((resolve, reject) => {
//     db.response
//       .destroy({
//         where: {
//           three_words: threeWords,
//           username,
//           qNum
//         }
//       })
//       .then(() => resolve(true))
//       .catch((e) => reject(e));
//   });
// }

export default {
  create,
  bulkCreate,
  get,
  find
  // update,
  // remove
};
