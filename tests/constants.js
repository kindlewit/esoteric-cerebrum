/**
 * All constants used for testing
 */

const { singleUser, multipleUsers} = require('./raw_data');

module.exports = {
  user: {
    endpoints: {
      fetchAllUsers: '/api/v1/user',
      createNewUser: '/api/v1/user',
    },
    data: {
      singleUser,
      multipleUsers
    }
  }
};
