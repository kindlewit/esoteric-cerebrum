import React from 'react';
import QuizCard from '../components/QuizCard';

let singleQuiz = {
  three_words: 'some-three-words',
  title: 'Test Quiz 1',
  description: 'Test Quiz description Lorem ipsum dolor sit amet',
  start: 1643820622000,
  config: {
    file_upload: true,
    duration: 3.6e6
  },
  topics: [
    'quizzing',
    'questions',
    'python',
    'monty-python',
    'lorem',
    'lipsum',
    'latin'
  ]
};

export default function HomePage() {
  return (
    <div>
      <QuizCard type="water" quiz={singleQuiz} />
      <QuizCard type="NEW" />
    </div>
  );
}
