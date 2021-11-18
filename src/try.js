/**
 * Trial file just to see how QuizTopic table works
 */
import db from './orm';

let sampleUserData = {
  username: 'kevin',
  display_name: 'kevin',
  password: 'kevin',
  email: 'kevin1@.com'
};
let sampleQuizData = {
  three_words: 'home-alone-quiz',
  title: 'First home quiz',
  start: new Date(),
  username: 'kevin',
  config: {
    duration: 1000,
    file_upload: false
  },
  topics: [
    { text: 'home' },
    { text: 'alone' },
    { text: 'snow' },
    { text: 'christmas' }
  ]
};

async function creator() {
  await db.user.create(sampleUserData);
  await db.quiz.create(sampleQuizData, {
    returning: true,
    ignoreDuplicates: true,
    include: [
      {
        model: db.topic,
        as: 'topics',
        updateOnDuplicate: ['updated_at']
      }
    ]
  });
  let allQuiz = await db.quiz.findAll({
    where: {
      three_words: sampleQuizData.three_words
    },
    include: [
      {
        model: db.topic,
        as: 'topics'
      }
    ],
    plain: true,
    nest: true
  });
  console.log(JSON.stringify(allQuiz.toJSON(), null, 1));
}

// creator();
let secondSampleQuiz = {
  three_words: 'alone-home-quiz',
  title: 'Alone home quiz',
  start: new Date(),
  username: 'kevin',
  config: {
    duration: 1000,
    file_upload: false
  },
  topics: [
    { text: 'home' },
    { text: 'alone' },
    { text: 'summer' },
    { text: 'theives' }
  ]
};

async function contender() {
  await db.quiz.create(secondSampleQuiz, {
    returning: true,
    ignoreDuplicates: true,
    include: [
      {
        model: db.topic,
        as: 'topics',
        updateOnDuplicate: ['updated_at']
      }
    ]
  });
  let allQuiz = await db.quiz.findAll({
    where: {
      three_words: secondSampleQuiz.three_words
    },
    include: [
      {
        model: db.topic,
        as: 'topics'
      }
    ],
    plain: true,
    nest: true
  });
  console.log(JSON.stringify(allQuiz.toJSON(), null, 1));
}

creator();
// contender();

/**
 * Contender and Creator clash as they insert for each topic.
 * This will cause same topic to have multiple rows
 *
 * Only for contender
 * INSERT INTO "QuizTopics" ("quizThreeWords","topicId") VALUES ($1,$2)
 * ON CONFLICT DO NOTHING RETURNING "quizThreeWords","topicId";
 */
