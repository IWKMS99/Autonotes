import React from 'react';
import { render, screen } from '@testing-library/react';
import { AnimatedItem, AnimatedList } from './AnimatedList';

jest.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_, tag) => {
        const ReactLib = require('react');
        return ({ children, layout, variants, initial, animate, exit, transition, whileHover, whileTap, ...props }) => ReactLib.createElement(tag, props, children);
      },
    }
  ),
  useReducedMotion: () => false,
}));

describe('AnimatedList', () => {
  test('renders list and items', () => {
    render(
      <AnimatedList className="animated-list">
        <AnimatedItem as="article">item-1</AnimatedItem>
        <AnimatedItem as="article">item-2</AnimatedItem>
      </AnimatedList>
    );

    expect(screen.getByText('item-1')).toBeInTheDocument();
    expect(screen.getByText('item-2')).toBeInTheDocument();
    expect(document.querySelector('.animated-list')).toBeInTheDocument();
  });

  test('supports custom container element', () => {
    render(
      <AnimatedList as="ul">
        <AnimatedItem as="li">li-item</AnimatedItem>
      </AnimatedList>
    );

    expect(document.querySelector('ul')).toBeInTheDocument();
    expect(document.querySelector('li')).toBeInTheDocument();
  });
});
