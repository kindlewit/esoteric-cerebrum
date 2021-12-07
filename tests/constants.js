/**
 * All constants used for testing
 */

const {
  singleUser,
  multiUsers,
  userWithoutUsername,
  userWithoutEmail,
  userWithoutPassword,
  updatedSingleUser,
  userWithChangedUsername
} = require('./raw_data');

module.exports = {
  user: {
    endpoints: {
      fetchAllUsers: '/api/v1/user',
      fetchOneUser: '/api/v1/user',
      createUser: '/api/v1/user',
      loginUser: '/api/v1/user/_login',
      updateUser: '/api/v1/user',
      deleteUser: '/api/v1/user'
    },
    data: {
      singleUser,
      multiUsers,
      userWithoutUsername,
      userWithoutPassword,
      userWithoutEmail,
      updatedSingleUser,
      userWithChangedUsername
    },
    cookieId: '_sessionId'
  }
};
