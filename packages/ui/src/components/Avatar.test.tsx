import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar.tsx';

describe('Avatar', () => {
  it('shows the first character when no avatarUrl', () => {
    render(<Avatar name="王梓涵" />);
    expect(screen.getByText('王')).toBeTruthy();
  });
  it('renders an img with alt when avatarUrl is given', () => {
    render(<Avatar name="李四" avatarUrl="http://x/a.png" />);
    expect(screen.getByRole('img', { name: '李四' })).toBeTruthy();
  });
});
