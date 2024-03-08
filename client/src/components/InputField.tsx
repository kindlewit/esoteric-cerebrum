import React from 'react';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PasswordIcon from '@mui/icons-material/Password';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import styles from '../styles/Input.module.css';

type InputProps = {
  type: String;
};

export default function InputField(props: InputProps) {
  if (props.type === 'username') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '1rem'
        }}
        className={styles.input_field}
      >
        <PersonOutlineIcon className={styles.logo} />
        <div>
          <span>
            <strong>u/</strong>
          </span>
          <input type="text" placeholder="username" className={styles.input} />
        </div>
      </div>
    );
  }
  if (props.type === 'password') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '1rem'
        }}
        className={styles.input_field}
      >
        <PasswordIcon className={styles.logo} />
        <div>
          <input type="text" placeholder="password" className={styles.input} />
        </div>
        <VisibilityOffIcon className={styles.logo} />
      </div>
    );
  }
  return;
}
