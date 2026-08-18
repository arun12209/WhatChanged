import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('WhatChanged App', () => {
  it('renders the header with WhatChanged brand and navigation tabs', () => {
    render(<App />);
    expect(screen.getByText('WhatChanged')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });
});
