import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EventDetailDrawer } from '../features/event-detail/EventDetailDrawer';
import { MOCK_EVENTS } from '../data/mockData';

describe('EventDetailDrawer Component', () => {
  it('renders nothing when event is null', () => {
    const { container } = render(
      <EventDetailDrawer event={null} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders change overview, actor, and metadata when event provided', () => {
    const event = MOCK_EVENTS[0];
    render(<EventDetailDrawer event={event} onClose={vi.fn()} />);

    expect(screen.getByText('Permission Set updated')).toBeInTheDocument();
    expect(screen.getByText(event.description)).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('changedfieldperms')).toBeInTheDocument();
  });

  it('collapses and expands raw Salesforce audit event data', () => {
    const event = MOCK_EVENTS[0];
    render(<EventDetailDrawer event={event} onClose={vi.fn()} />);

    const toggleButton = screen.getByText('Raw Salesforce Audit Event');
    expect(screen.queryByText(/Id: sat-001/i)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText(/sat-001/i)).toBeInTheDocument();
  });

  it('copies event details when copy button clicked', () => {
    const event = MOCK_EVENTS[0];
    render(<EventDetailDrawer event={event} onClose={vi.fn()} />);

    const copyBtn = screen.getByText('Copy details');
    fireEvent.click(copyBtn);
    expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
  });
});
