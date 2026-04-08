import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar.jsx';

describe('ProgressBar', () => {
  it('renders the progress label and percentage', () => {
    render(<ProgressBar percent={42} />);
    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText('42%')).toBeTruthy();
  });

  it('clamps values below 0 to 0', () => {
    render(<ProgressBar percent={-10} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('clamps values above 100 to 100', () => {
    render(<ProgressBar percent={150} />);
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('defaults to 0% when no percent prop given', () => {
    render(<ProgressBar />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('sets the bar width style to match the clamped percent', () => {
    const { container } = render(<ProgressBar percent={75} />);
    const bar = container.querySelector('[style*="width"]');
    expect(bar.style.width).toBe('75%');
  });
});
