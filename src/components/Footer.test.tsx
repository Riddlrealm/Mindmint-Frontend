import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MindmintFooter from './Footer';

describe('MindmintFooter', () => {
  it('renders the footer navigation sections', () => {
    render(<MindmintFooter />);

    expect(screen.getByText('Game Mode')).toBeInTheDocument();
    expect(screen.getByText('Newsletter')).toBeInTheDocument();
  });
});
