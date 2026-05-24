import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const THEME_STORAGE_KEY = 'autonotes-theme';
const THEME_TRANSITION_MS = 620;

const ThemeContext = createContext(null);

const getSystemTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return getSystemTheme();
};

const applyThemeTransition = (origin) => {
  if (
    typeof window === 'undefined'
    || typeof document === 'undefined'
    || !origin
    || !document.startViewTransition
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    return null;
  }

  const maxRadius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y)
  );

  return {
    maxRadius,
    x: origin.x,
    y: origin.y,
  };
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    isDarkTheme: theme === 'dark',
    setTheme,
    toggleTheme: (origin) => {
      const transitionConfig = applyThemeTransition(origin);

      if (!transitionConfig) {
        setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
        return;
      }

      const transition = document.startViewTransition(() => {
        setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${transitionConfig.x}px ${transitionConfig.y}px)`,
              `circle(${transitionConfig.maxRadius}px at ${transitionConfig.x}px ${transitionConfig.y}px)`,
            ],
          },
          {
            duration: THEME_TRANSITION_MS,
            easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      }).catch(() => {});
    },
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
};
