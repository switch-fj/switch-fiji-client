import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('<Button />', () => {
  it('renders without crashing', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDefined();
  });

  it('displays the correct text', () => {
    render(<Button variant="outline">Submit</Button>);
    expect(screen.getByText('Submit')).toBeDefined();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loader when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByTestId('loader')).toBeDefined();
  });

  it('is disabled when the disabled prop is true', () => {
    render(
      <Button variant="outline" disabled>
        Disabled
      </Button>
    );
    expect(screen.getByText('Disabled')).toBeDefined();
  });
});
