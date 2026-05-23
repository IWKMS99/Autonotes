export const motionTransition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
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
      duration: 0.16,
      ease: 'easeOut',
    },
  },
};

export const reducedPageMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.12,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.08,
    },
  },
};

export const listMotion = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.04,
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
    transition: {
      duration: 0.12,
    },
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
      ease: 'easeOut',
    },
  },
};

export const reducedMenuMotion = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.12,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.08,
    },
  },
};

export const cardHoverMotion = {
  y: -2,
  transition: {
    duration: 0.16,
    ease: 'easeOut',
  },
};

export const cardTapMotion = {
  scale: 0.99,
};