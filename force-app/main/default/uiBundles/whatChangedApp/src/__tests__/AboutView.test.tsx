import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutView } from '../features/settings/AboutView';

describe('AboutView Component', () => {
  it('renders WhatChanged header banner and version badge', () => {
    render(<AboutView />);
    expect(screen.getByRole('heading', { level: 1, name: /WhatChanged/i })).toBeInTheDocument();
    expect(screen.getByText(/v1.0.0 GA/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero-Egress Trust Boundary/i)).toBeInTheDocument();
  });

  it('renders 3 core platform pillars and does not render removed technical metadata cards', () => {
    render(<AboutView />);
    expect(screen.getByText(/100% In-Org Privacy/i)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic Risk Scoring/i)).toBeInTheDocument();
    expect(screen.getByText(/Smart Story Clustering/i)).toBeInTheDocument();

    // Verify old cards are removed
    expect(screen.queryByText(/Architecture Target/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Multi-Framework React \(UIBundle\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Salesforce API Version/i)).not.toBeInTheDocument();
  });

  it('renders domain coverage, power features, and security model', () => {
    render(<AboutView />);
    expect(screen.getByText(/Comprehensive Domain Coverage/i)).toBeInTheDocument();
    expect(screen.getByText(/11 Domains Monitored/i)).toBeInTheDocument();
    expect(screen.getByText(/Power Features & Pro Tips/i)).toBeInTheDocument();
    expect(screen.getByText(/Incident Investigation Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Command Palette/i)).toBeInTheDocument();
    expect(screen.getByText(/Security & Authorization Model/i)).toBeInTheDocument();
    expect(screen.getByText(/Event Normalization Pipeline/i)).toBeInTheDocument();
  });

  it('renders developer attribution card for Arun Kumar', () => {
    render(<AboutView />);
    expect(screen.getByText(/Developed with/i)).toBeInTheDocument();
    expect(screen.getByText(/Arun Kumar/i)).toBeInTheDocument();
    expect(screen.getByText(/Lead Software Engineer • Built for the Trailblazer Community/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Arun Kumar/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/arun-kumar4/'
    );
    expect(screen.getByRole('link', { name: /GitHub Repo/i })).toHaveAttribute(
      'href',
      'https://github.com/arun12209/WhatChanged'
    );
  });
});
