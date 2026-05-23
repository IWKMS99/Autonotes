import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  listMotion,
  listItemMotion,
  reducedListItemMotion,
} from 'shared/lib/motion';

export const AnimatedList = ({
  children,
  className = '',
  as = 'div',
  ...props
}) => {
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      className={className}
      initial="initial"
      animate="animate"
      variants={listMotion}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export const AnimatedItem = ({
  children,
  className = '',
  as = 'div',
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? reducedListItemMotion : listItemMotion;
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      className={className}
      variants={variants}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};