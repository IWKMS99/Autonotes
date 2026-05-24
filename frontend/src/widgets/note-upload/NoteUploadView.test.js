import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoteUploadView } from './NoteUploadView';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

jest.mock('motion/react', () => ({
  AnimatePresence: ({ children }) => <>{children}</>,
  motion: new Proxy(
    {},
    {
      get: (_, tag) => {
        const ReactLib = require('react');
        return ({ children, ...props }) => ReactLib.createElement(tag, props, children);
      },
    }
  ),
  useReducedMotion: () => false,
}), { virtual: true });

jest.mock('shared', () => ({
  AnimatedPage: ({ children, reducedVariants, variants, ...props }) => <div {...props}>{children}</div>,
  Icon: () => <span>icon</span>,
  cardHoverMotion: {},
  cardTapMotion: {},
  listItemMotion: {},
  listMotion: {},
  presenceMotion: {},
  progressMotion: {},
  reducedListItemMotion: {},
  reducedPresenceMotion: {},
  reducedProgressMotion: {},
  reducedSectionMotion: {},
  sectionMotion: {},
}), { virtual: true });

describe('NoteUploadView smoke', () => {
  test('renders form and actions', () => {
    const props = {
      formData: { title: '' },
      loading: false,
      error: '',
      previews: [],
      dragActive: false,
      uploadProgress: 0,
      fileInputRef: { current: null },
      handleInputChange: () => {},
      handleFileChange: () => {},
      handleDrag: () => {},
      handleDrop: () => {},
      removeFile: () => {},
      handleSubmit: (event) => event.preventDefault(),
      isSubmitDisabled: false,
    };

    render(
      <NoteUploadView {...props} />
    );

    expect(screen.getByRole('button', { name: /Создать конспект/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /К списку конспектов/i })).toBeInTheDocument();
    expect(screen.getByText(/Как получить лучший результат/i)).toBeInTheDocument();
  });
});
