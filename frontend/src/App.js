import React from 'react';
import { MotionConfig } from 'motion/react';
import App from './app/App';

const RootApp = () => (
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>
);

export default RootApp;