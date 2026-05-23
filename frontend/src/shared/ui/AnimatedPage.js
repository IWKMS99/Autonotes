import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { pageMotion, reducedPageMotion } from 'shared/lib/motion';

export const AnimatedPage = ({ children, className = '', ...props }) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? reducedPageMotion : pageMotion;

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  );
};