import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StarRating from './StarRating.jsx';

describe('StarRating', () => {
  it('renders 5 star buttons', () => {
    render(<StarRating value={0} onChange={() => {}} />);
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('calls onChange with correct star value when clicked', () => {
    const onChange = vi.fn();
    render(<StarRating value={0} onChange={onChange} />);
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[2]); // 3rd star = rating 3
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange when readOnly', () => {
    const onChange = vi.fn();
    render(<StarRating value={3} onChange={onChange} readOnly />);
    const stars = screen.getAllByRole('button');
    fireEvent.click(stars[0]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables buttons when readOnly', () => {
    render(<StarRating value={3} readOnly />);
    const stars = screen.getAllByRole('button');
    stars.forEach((star) => expect(star).toBeDisabled());
  });

  it('stars have accessible aria-labels', () => {
    render(<StarRating value={0} onChange={() => {}} />);
    expect(screen.getByLabelText('1 star')).toBeTruthy();
    expect(screen.getByLabelText('2 stars')).toBeTruthy();
    expect(screen.getByLabelText('5 stars')).toBeTruthy();
  });
});
