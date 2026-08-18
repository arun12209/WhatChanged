import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HighlightText } from '../components/common/HighlightText';
import { UserMenu } from '../components/shell/UserMenu';

describe('HighlightText Component', () => {
  it('renders normal text when no query is provided', () => {
    render(<HighlightText text="Flow Account_Move_Wizard activated" />);
    expect(screen.getByText('Flow Account_Move_Wizard activated')).toBeInTheDocument();
  });

  it('highlights matched token inside mark tag', () => {
    const { container } = render(
      <HighlightText text="Flow Account_Move_Wizard activated" query="Account" />
    );

    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe('Account');
  });

  it('performs case-insensitive match safely', () => {
    const { container } = render(
      <HighlightText text="Permission Set C360 updated" query="c360" />
    );

    const mark = container.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe('C360');
  });
});

describe('UserMenu Component', () => {
  it('renders user avatar trigger button', () => {
    render(
      <UserMenu
        environment="Production"
        onNavigateTab={vi.fn()}
        onOpenCommandPalette={vi.fn()}
      />
    );

    expect(screen.getByLabelText('User profile menu')).toBeInTheDocument();
    expect(screen.getByText('AK')).toBeInTheDocument();
  });

  it('toggles dropdown popover on click and shows user details', () => {
    const handleNavigate = vi.fn();
    const handleOpenCmd = vi.fn();

    render(
      <UserMenu
        environment="Production"
        onNavigateTab={handleNavigate}
        onOpenCommandPalette={handleOpenCmd}
      />
    );

    // Initial state: menu closed
    expect(screen.queryByText('Arun Kumar')).not.toBeInTheDocument();

    // Click avatar to open menu
    fireEvent.click(screen.getByLabelText('User profile menu'));

    expect(screen.getByText('Arun Kumar')).toBeInTheDocument();
    expect(screen.getByText('arun.kumar@enterprise.org')).toBeInTheDocument();
    expect(screen.getByText('System Administrator')).toBeInTheDocument();
    expect(screen.getByText('v66.0 GA')).toBeInTheDocument();

    // Click Command Palette action
    fireEvent.click(screen.getByText('Command Palette'));
    expect(handleOpenCmd).toHaveBeenCalled();
  });
});
