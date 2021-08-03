export const singleQuiz = {
  username: 'test_user1',
  title: 'Random Quiz 1',
  description: 'Quiz about random stuff',
  topics: 'stuff,random,randomize,entropy',
  duration: 600000,
  start: 1627759800000
};

export const multiQuizzes = [
  {
    username: 'test_user2',
    title: 'Specific Quiz 1',
    topics: 'specific,specificity,speciology',
    duration: 54e5,
    file_upload: false
  },
  {
    username: 'test_user3',
    title: 'Random Quiz 2',
    topics: [
      'random',
      'randomity'
    ],
    duration: 36e5,
    status: 1
  },
  {
    username: 'test_user4',
    title: 'Randomized specific quiz 42',
    topics: [
      'random',
      'randomize',
      'randomized',
      'specific',
      'specified'
    ],
    file_upload: false,
    status: 1
  }
];

const [nonFileQuiz, liveQuiz, nonFileLiveQuiz] = multiQuizzes;

export {
  nonFileQuiz,
  liveQuiz,
  nonFileLiveQuiz
};
