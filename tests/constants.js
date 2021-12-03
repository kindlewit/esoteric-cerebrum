/**
 * All constants used for testing
 */

const {
  singleUser,
  multiUsers,
  userWithoutUsername,
  userWithoutEmail,
  userWithoutPassword,
  updatedSingleUser
} = require('./raw_data');

module.exports = {
  user: {
    endpoints: {
      fetchAllUsers: '/api/v1/user',
      createNewUser: '/api/v1/user'
    },
    data: {
      singleUser,
      multiUsers,
      userWithoutUsername,
      userWithoutPassword,
      userWithoutEmail,
      updatedSingleUser
    }
  }
};
