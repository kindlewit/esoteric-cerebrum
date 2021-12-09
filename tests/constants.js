/**
 * All constants used for testing
 */

const {
  firstUser,
  secondUser,
  multiUsers,
  userWithoutUsername,
  userWithoutEmail,
  userWithoutPassword,
  updatedFirstUser,
  userWithChangedUsername,
  singleQuiz,
  quizWithUsernameBypass,
  updatedSingleQuiz,
  quizWithStateChange,
  quizWithThreeWordChange
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
      firstUser,
      secondUser,
      multiUsers,
      userWithoutUsername,
      userWithoutPassword,
      userWithoutEmail,
      updatedFirstUser,
      userWithChangedUsername
    },
    cookieId: '_sessionId'
  },
  quiz: {
    endpoints: {
      fetchAllQuizzes: '/api/v1/quiz',
      fetchOneQuiz: '/api/v1/quiz/{threeWords}',
      createQuiz: '/api/v1/quiz',
      updateQuiz: '/api/v1/quiz/{threeWords}',
      deleteQuiz: '/api/v1/quiz/{threeWords}',
      deleteMultipleQuiz: '/api/v1/quiz',
      cacheQuiz: '/api/v1/quiz'
    },
    data: {
      singleQuiz,
      quizWithUsernameBypass,
      updatedSingleQuiz,
      quizWithStateChange,
      quizWithThreeWordChange
    }
  }
};
