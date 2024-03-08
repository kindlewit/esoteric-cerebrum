import React from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';

import styles from '../styles/quizcard.module.css';
import { QUIZ_CARD } from '../constants';

// TODO: Move QuizConfig type out of here.
type QuizConfig = {
  file_upload?: boolean;
  duration: number;
  meet_link?: string;
  topics?: string[];
};
// TODO: Move Quiz type out of here.
type Quiz = {
  title: string;
  three_words: string;
  description?: string;
  start: number;
  status?: number;
  config?: QuizConfig;
};

type QuizCardProps = {
  type: string;
  quiz?: Quiz;
  baseColor?: string;
};

export default function QuizCard(props: QuizCardProps) {
  if (props.type === 'NEW') {
    return (
      <Link href={'/new'}>
        <div className={styles.quiz_card + ' ' + styles.quiz_card_new}>
          <div className={styles.quiz_add_icon_container}>
            <AddIcon className={styles.quiz_add_icon} />
          </div>
        </div>
      </Link>
    );
  } else {
    let quizDateTime = dayjs(props.quiz.start);
    let quizDate = quizDateTime.format(QUIZ_CARD.date_format);
    let quizTime = quizDateTime.format(QUIZ_CARD.time_format);

    return (
      <div className={styles.quiz_card + ' ' + styles.quiz_card_blue}>
        <div className={styles.quiz_title_container}>
          <h2 className={styles.quiz_title}>
            {props.quiz.title.length > 82
              ? props.quiz.title.substring(0, 82) + '...'
              : props.quiz.title}
          </h2>
          <p className={styles.three_words}>{props.quiz.three_words}</p>
        </div>

        <div className={styles.quiz_start_container}>
          <p className={styles.quiz_start} suppressHydrationWarning={true}>
            {quizDate}
          </p>
          <p className={styles.quiz_start} suppressHydrationWarning={true}>
            {quizTime}
          </p>
        </div>
      </div>
    );
  }
}
