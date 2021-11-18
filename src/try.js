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
  topics: ['home', 'alone', 'snow', 'christmas']
};
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

async function creator() {
  await db.user.create(sampleUserData);

  let { topics } = sampleQuizData;

  const quiz = await db.quiz.create(sampleQuizData, {
    returning: true,
    raw: true
  });

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    console.log('\t', t);
    let [row, created] = await db.topic.findOrCreate({
      where: { text: t }
    });
    console.log(row);
    await db.quizTopic.create({
      id: row.dataValues.id,
      three_words: quiz.three_words
    });
  }
}
async function creator2() {
  let { topics } = secondSampleQuiz;

  const quiz = await db.quiz.create(secondSampleQuiz, {
    returning: true,
    raw: true
  });

  for (let i = 0; i < topics.length; i++) {
    const t = topics[i];
    console.log('\t', t);
    let [row, created] = await db.topic.findOrCreate({
      where: { text: t }
    });
    console.log(row);
    await db.quizTopic.create({
      id: row.dataValues.id,
      three_words: quiz.three_words
    });
  }
}
async function finder(wrd) {
  let allQuiz = await db.quiz.findAll({
    where: {
      three_words: wrd
    },
    include: [
      {
        model: db.topic,
        as: 'topics',
        through: {
          model: db.quizTopic
        }
      }
    ],
    plain: true,
    nest: true
  });
  console.log('\n\n\nAll Quiz:', JSON.stringify(allQuiz.dataValues));
  // console.log(JSON.stringify(allQuiz.toJSON(), null, 1));
}

creator()
  .then(() => {
    finder(sampleQuizData.three_words);
    return creator2();
  })
  .then(() => {
    finder(secondSampleQuiz.three_words);
  });

async function contender() {
  await db.quiz.create(secondSampleQuiz, {
    returning: true,
    include: [
      {
        model: db.topic,
        as: 'topics',
        through: {
          model: db.quizTopic
        }
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

// creator();
// contender();

/**
 * Contender and Creator clash as they insert for each topic.
 * This will cause same topic to have multiple rows
 *
 * Only for contender
 * INSERT INTO "QuizTopics" ("quizThreeWords","topicId") VALUES ($1,$2)
 * ON CONFLICT DO NOTHING RETURNING "quizThreeWords","topicId";
 */
