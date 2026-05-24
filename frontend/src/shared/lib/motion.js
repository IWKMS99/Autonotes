export const motionTokens = {
  duration: {
    instant: 0.01,
    fast: 0.16,
    normal: 0.22,
    slow: 0.28,
    reduced: 0.1,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1],
    out: 'easeOut',
  },
  stagger: {
    item: 0.04,
    childrenDelay: 0.04,
  },
};

export const motionTransition = {
  duration: motionTokens.duration.normal,
  ease: motionTokens.ease.standard,
};

export const reducedTransition = {
  duration: motionTokens.duration.reduced,
  ease: motionTokens.ease.out,
};

export const pageMotion = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: motionTransition,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.out,
    },
  },
};

export const reducedPageMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: reducedTransition,
  },
  exit: {
    opacity: 0,
    transition: reducedTransition,
  },
};

export const sectionMotion = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: motionTransition,
  },
};

export const reducedSectionMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: reducedTransition,
  },
};

export const listMotion = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: motionTokens.stagger.item,
      delayChildren: motionTokens.stagger.childrenDelay,
    },
  },
};

export const listItemMotion = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: motionTransition,
  },
};

export const reducedListItemMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: reducedTransition,
  },
  exit: {
    opacity: 0,
    transition: reducedTransition,
  },
};

export const presenceMotion = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.standard,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.out,
    },
  },
};

export const reducedPresenceMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: reducedTransition,
  },
  exit: {
    opacity: 0,
    transition: reducedTransition,
  },
};

export const menuMotion = {
  initial: {
    opacity: 0,
    y: -8,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: motionTransition,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.98,
    transition: {
      duration: 0.14,
      ease: motionTokens.ease.out,
    },
  },
};

export const reducedMenuMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: reducedTransition,
  },
  exit: {
    opacity: 0,
    transition: reducedTransition,
  },
};

export const cardHoverMotion = {
  y: -2,
  transition: {
    duration: motionTokens.duration.fast,
    ease: motionTokens.ease.out,
  },
};

export const cardTapMotion = {
  scale: 0.99,
};

export const progressMotion = {
  transition: {
    duration: motionTokens.duration.fast,
    ease: motionTokens.ease.standard,
  },
};

export const reducedProgressMotion = {
  transition: {
    duration: motionTokens.duration.instant,
  },
};
