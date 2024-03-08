import React from 'react';
import Image from 'next/image';

import styles from '../styles/Signon.module.css';
import InputField from '../components/InputField';
import Pill from '../assets/pill-2.svg';

export default function SignonPage() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          minHeight: '100vh'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <form
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '2rem'
            }}
          >
            <InputField type={'username'} />
            <InputField type={'password'} />
            <p>Log in as</p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '5.25rem'
              }}
            >
              <button className={styles.button}>Quiz Attendee</button>
              <button className={styles.button}>Quiz Master</button>
            </div>
          </form>
          <span>
            New to kindlewit? <a href="">Sign up</a>
          </span>
        </div>
      </div>
      <Image
        src={Pill}
        width={566}
        height={910}
        alt="Asset-pill-1"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0
        }}
      />
      <Image src={Pill} width={500} height={500} alt="Asset-pill-1" />
    </>
  );
}
