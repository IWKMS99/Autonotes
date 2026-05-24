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
  stagger,
  delayChildren,
  layout = false,
  ...props
}) => {
  const MotionComponent = motion[as] || motion.div;
  const variants = stagger !== undefined || delayChildren !== undefined
    ? {
      ...listMotion,
      animate: {
        transition: {
          ...listMotion.animate.transition,
          ...(stagger !== undefined ? { staggerChildren: stagger } : {}),
          ...(delayChildren !== undefined ? { delayChildren } : {}),
        },
      },
    }
    : listMotion;

  return (
    <MotionComponent
      className={className}
      initial="initial"
      animate="animate"
      variants={variants}
      layout={layout}
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
  layout = false,
  reduced,
  variants,
  reducedVariants,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isReduced = reduced ?? shouldReduceMotion;
  const activeVariants = isReduced
    ? reducedVariants || reducedListItemMotion
    : variants || listItemMotion;
  const MotionComponent = motion[as] || motion.div;

  return (
    <MotionComponent
      className={className}
      variants={activeVariants}
      layout={!isReduced && layout}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
