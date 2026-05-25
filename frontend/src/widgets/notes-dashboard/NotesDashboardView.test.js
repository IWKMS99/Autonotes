import React from 'react';
import { render, screen } from '@testing-library/react';
import { NotesDashboardView } from './NotesDashboardView';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}), { virtual: true });

jest.mock('motion/react', () => ({
  useReducedMotion: () => false,
}), { virtual: true });

const MotionLikeDiv = ({ children, layout, variants, reducedVariants, whileHover, whileTap, ...props }) => (
  <div {...props}>{children}</div>
);

jest.mock('shared', () => ({
  AnimatedItem: MotionLikeDiv,
  AnimatedList: MotionLikeDiv,
  AnimatedPage: MotionLikeDiv,
  Icon: () => <span>icon</span>,
  cardHoverMotion: {},
  cardTapMotion: {},
  formatDate: () => 'date',
  getTimeAgo: () => 'now',
  presenceMotion: {},
  reducedListItemMotion: {},
  reducedPresenceMotion: {},
  sectionMotion: {},
}), { virtual: true });

describe('NotesDashboardView smoke', () => {
  test('renders note cards and toolbar controls', () => {
    const notes = [
      {
        id: 1,
        title: 'Physics',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        summaryText: 'summary',
        imageCount: 7,
        images: [{ id: 1 }],
      },
    ];

    render(
      <NotesDashboardView
        notes={notes}
        filteredNotes={notes}
        searchTerm=""
        sortBy="createdAt"
        sortOrder="desc"
        isLoading={false}
        error=""
        onSearchChange={() => {}}
        onSortByChange={() => {}}
        onSortOrderChange={() => {}}
        onRetry={() => {}}
      />
    );

    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText(/7/)).toBeInTheDocument();
    expect(screen.getByLabelText('Фильтры и сортировка')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Открыть конспект/i })).toBeInTheDocument();
  });
});
