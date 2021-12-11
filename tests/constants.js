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
  quizWithThreeWordChange,
  mcqQuestions,
  msqQuestions,
  textQuestions,
  questionWithoutOptionsWithAnswer,
  questionWithoutOptionsWithoutAnswer,
  questionWithoutAnswer,
  questionWithoutText,
  questionWithoutFormatWithoutOptions,
  questionWithoutFormatWithOptions,
  questionWithoutWeightage
} = require('./raw_data');

module.exports = {
  user: {
    endpoints: {
      fetchAllUsers: '/api/v1/user',
      fetchOneUser: '/api/v1/user/{username}',
      createUser: '/api/v1/user',
      loginUser: '/api/v1/user/_login',
      updateUser: '/api/v1/user/{username}',
      updateMultipleUser: '/api/v1/user',
      deleteUser: '/api/v1/user/{username}',
      deleteMultipleUser: '/api/v1/user'
    },
    data: {
      firstUser,
      secondUser,
      thirdUser: multiUsers[0],
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
      updateMultipleQuiz: '/api/v1/quiz',
      deleteQuiz: '/api/v1/quiz/{threeWords}',
      deleteMultipleQuiz: '/api/v1/quiz',
      fetchByUser: '/api/v1/quiz?username={username}'
    },
    data: {
      singleQuiz,
      quizWithUsernameBypass,
      updatedSingleQuiz,
      quizWithStateChange,
      quizWithThreeWordChange
    }
  },
  question: {
    endpoints: {
      generalUrl: '/api/v1/question',
      specificUrl: '/api/v1/question/{threeWords}',
      fetchAllQuestions: '/api/v1/question',
      fetchQuestionsForQuiz: '/api/v1/question/{threeWords}',
      createQuestionsForQuiz: '/api/v1/question/{threeWords}',
      updateQuestionsForQuiz: '/api/v1/question/{threeWords}',
      deleteQuestionsForQuiz: '/api/v1/question/{threeWords}',
      deleteQuestions: '/api/v1/question'
    },
    data: {
      mcqQuestions,
      msqQuestions,
      textQuestions,
      questionWithoutText,
      questionWithoutFormatWithoutOptions,
      questionWithoutFormatWithOptions,
      questionWithoutWeightage,
      questionWithoutOptionsWithAnswer,
      questionWithoutOptionsWithoutAnswer,
      questionWithoutAnswer
    },
    weightageToJson: (arr) => {
      return arr.map((a) => {
        a.weightage = { value: a.weightage };
        return a;
      });
    },
    numbering: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i].number = 1 + i;
      }
      return arr;
    },
    addData: (arr, d) => {
      return arr.map((a) => ({ ...a, ...d }));
    }
  }
};
