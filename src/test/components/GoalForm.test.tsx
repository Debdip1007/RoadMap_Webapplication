import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { GoalForm } from '../../components/goals/GoalForm';
import { useAuth } from '../../hooks/useAuth';

// Mock the hooks and dependencies
vi.mock('../../hooks/useAuth');
vi.mock('../../lib/supabase');
vi.mock('react-hot-toast');

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com'
};

describe('GoalForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      loading: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders goal form when open', () => {
    render(
      <GoalForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create New Goal')).toBeInTheDocument();
    expect(screen.getByLabelText('Goal Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <GoalForm
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Create New Goal')).not.toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <GoalForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const submitButton = screen.getByText('Create Goal');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('allows adding and removing tags', () => {
    render(
      <GoalForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const tagInput = screen.getByPlaceholderText('Add a tag');
    const addButton = screen.getByRole('button', { name: /plus/i });

    fireEvent.change(tagInput, { target: { value: 'test-tag' } });
    fireEvent.click(addButton);

    expect(screen.getByText('test-tag')).toBeInTheDocument();

    const removeButton = screen.getByRole('button', { name: /x/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText('test-tag')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <GoalForm
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});