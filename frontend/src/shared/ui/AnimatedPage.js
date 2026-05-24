import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { pageMotion, reducedPageMotion } from 'shared/lib/motion';

export const AnimatedPage = ({
  children,
  className = '',
  as = 'div',
  delay = 0,
  layout = false,
  reduced,
  variants,
  reducedVariants,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const isReduced = reduced ?? shouldReduceMotion;
  const activeVariants = isReduced
    ? reducedVariants || reducedPageMotion
    : variants || pageMotion;
  const MotionComponent = motion[as] || motion.div;
  const animateVariant = delay && !isReduced
    ? {
      ...activeVariants.animate,
      transition: {
        ...(activeVariants.animate?.transition || {}),
        delay,
      },
    }
    : activeVariants.animate;

  return (
    <MotionComponent
      className={className}
      initial="initial"
      animate={animateVariant}
      exit="exit"
      variants={activeVariants}
      layout={!isReduced && layout}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};
