/**
 * All data to use for testing
 */

let firstUser = {
  username: 'test_user1',
  password: 'test_user1',
  display_name: 'User Tester I',
  email: 'user1@test.com'
};

let secondUser = {
  username: 'test_user2',
  password: 'test_user2',
  display_name: 'User Tester II',
  email: 'user2@test.com'
};

let updatedFirstUser = {
  username: 'test_user1',
  password: 'test_userOne',
  display_name: 'User Tester 1',
  email: 'user1@test.com'
};

let multiUsers = [
  {
    username: 'test_user3',
    password: 'test_user3',
    display_name: 'User Tester The Third',
    email: 'user3@test.com'
  },
  {
    username: 'test_user4',
    password: 'test_user4',
    display_name: 'User Tester 4th',
    email: 'user4@test.com'
  }
];

let userWithoutUsername = {
  password: 'test_user5',
  display_name: 'User Tester 5',
  email: 'user5@test.com'
};

let userWithoutPassword = {
  username: 'test_user6',
  display_name: 'User Tester 6',
  email: 'user6@test.com'
};

let userWithoutEmail = {
  username: 'test_user7',
  password: 'test_user7',
  display_name: 'User Tester 7th'
};

let userWithChangedUsername = {
  username: 'test_user220',
  password: 'test_user1',
  display_name: 'User Tester I',
  email: 'user1@test.com'
};

let singleQuiz = {
  title: 'Test Quiz 1',
  description: 'Test Quiz description Lorem ipsum dolor sit amet',
  start: 1643820622000,
  config: {
    file_upload: true,
    duration: 3.6e6
  },
  topics: [
    "quizzing",
    "questions",
    "python",
    "monty-python",
    "lorem",
    "lipsum",
    "latin"
  ]
};

let updatedSingleQuiz = {
  title: 'Updated Quiz 1',
  description: 'Updated quiz description'
};

let quizWithUsernameBypass = {
  title: 'Test Quiz 1',
  username: 'faker_user'
};

let quizWithStateChange = {
  status: 3
};

let quizWithThreeWordChange = {
  three_words: 'Changed-This-Manually'
};

let mcqQuestions = [
  {
    text: 'How hot is the surface of the sun?',
    answer_format: 'mcq',
    options: ['1,233 K', '5,778 K', '12,130 K', '101,300 K'],
    answer: 1,
    weightage: 5
  },
  {
    text: 'What is the capital of Spain?',
    answer_format: 'mcq',
    options: ['Berlin', 'Buenos Aires', 'Madrid', 'San Juan'],
    answer: 2,
    weightage: 5
  },
  {
    text: 'What is 70 degrees Fahrenheit in Celsius?',
    answer_format: 'mcq',
    options: ['18.8889', '20', '21.1111', '158'],
    answer: 2,
    weightage: 5
  }
];

let msqQuestions = [
  {
    text: 'Which of the following brands are car companies?',
    answer_format: 'msq',
    options: [
      'Nokia',
      'Ford',
      'Apple',
      'Samsung',
      'Volkswagen',
      'Tesla',
      'Hyundai',
      'Lenovo'
    ],
    answer: [1, 4, 5, 6],
    weightage: 20
  },
  {
    text: 'Which 2 of the following countries battle in Cricket is termed as The Ashes tournament?',
    answer_format: 'msq',
    options: [
      'England',
      'India',
      'Canada',
      'Australia',
      'South Africa',
      'New Zealand'
    ],
    answer: [0, 3],
    weightage: 10
  },
  {
    text: 'Name the characters in the sitcom The Office(US)',
    answer_format: 'msq',
    options: [
      'Jake Peralta',
      'Michael Scott',
      'Rosa Diaz',
      'Dwight Schrute',
      'Amy Santiago',
      'Jim Halpert',
      'Raymond Holt',
      'Terry Jeffords',
      'Pam Beesley'
    ],
    answer: [1, 3, 5, 8],
    weightage: 20
  }
];

let textQuestions = [
  {
    text: 'What is your name?',
    answer_format: 'text',
    weightage: 10
  },
  {
    text: 'What is your quest?',
    answer_format: 'text',
    weightage: 10
  },
  {
    text: 'What is the capital of Assyria?',
    answer_format: 'text',
    weightage: 10
  }
];

let questionWithoutOptionsWithAnswer = {
  question: 'When did The Avengers come out?',
  answer_format: 'mcq',
  weightage: 3,
  answer: 0
};

let questionWithoutAnswer = {
  answer_format: 'msq',
  weightage: 5,
  text: 'Which of the following players are captains of Indian Cricket team?',
  options: ['MS Dhoni', 'KL Rahul', 'Virat Kohli', 'Rohit Sharma', 'R. Ashwin']
};

let questionWithoutOptionsWithoutAnswer = {
  question: 'When did The Avengers come out?',
  answer_format: 'mcq',
  weightage: 3
};

let questionWithoutText = {
  answer_format: 'text',
  weightage: 7
};

let questionWithoutFormatWithoutOptions = {
  text: 'Where is the format?',
  weightage: 10
};

let questionWithoutFormatWithOptions = {
  text: 'What is the format?',
  weightage: 10,
  options: ['textual', 'choice', 'fillup'],
  answer: 1
};

let questionWithoutWeightage = {
  text: 'No more scores?',
  answer_format: 'text'
};

let extraOptionNonAnswer = {
  character: 'D',
  text: 'Some Random Text',
  is_answer: false
};

let extraOptionAnswer = {
  character: 'E',
  text: 'Extra Random Text',
  is_answer: true
};

let conflictingOpt = {
  character: 'A',
  text: 'Conflicting option',
  is_answer: true
};

let questionForMultipleQuiz = [
  {
    three_words: 'abc',
    text: 'What is the first question',
    answer_format: 'text',
    weightage: {
      value: 10
    }
  },
  {
    three_words: 'def',
    text: 'What is the second question',
    answer_format: 'text',
    weightage: {
      value: 10
    }
  }
];

module.exports = {
  firstUser,
  secondUser,
  multiUsers,
  userWithoutUsername,
  userWithoutPassword,
  userWithoutEmail,
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
  questionWithoutWeightage,
  extraOptionNonAnswer,
  extraOptionAnswer,
  conflictingOpt,
  questionForMultipleQuiz
};
