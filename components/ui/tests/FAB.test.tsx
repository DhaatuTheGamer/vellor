import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FAB } from '../FAB';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// We need to mock the store since QuickLogModal uses it
vi.mock('../../store', () => ({
  useStore: vi.fn((selector) => {
    return selector({
      students: [],
      addTransaction: vi.fn(),
    });
  }),
}));

vi.mock('../Icon', () => ({
  Icon: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`}>{iconName}</span>,
}));

describe('FAB Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders the main FAB button', () => {
    renderWithRouter(<FAB />);
    expect(screen.getByRole('button', { name: /quick actions/i })).toBeInTheDocument();
  });

  it('opens the menu when main FAB is clicked', () => {
    renderWithRouter(<FAB />);

    // Initially menu items shouldn't be visible
    expect(screen.queryByRole('button', { name: /quick log lesson/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add new student/i })).not.toBeInTheDocument();

    // Click the main FAB
    fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));

    // Menu items should now be visible
    expect(screen.getByRole('button', { name: /quick log lesson/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new student/i })).toBeInTheDocument();
  });

  it('toggles the menu closed when main FAB is clicked twice', async () => {
    renderWithRouter(<FAB />);

    const mainFab = screen.getByRole('button', { name: /quick actions/i });

    // Open menu
    fireEvent.click(mainFab);
    expect(screen.getByRole('button', { name: /quick log lesson/i })).toBeInTheDocument();

    // Close menu
    fireEvent.click(mainFab);

    // Menu items should animate out (we wait for them to disappear)
    await waitFor(() => {
        expect(screen.queryByRole('button', { name: /quick log lesson/i })).not.toBeInTheDocument();
    });
  });

  it('navigates to add student page when Add Student is clicked', async () => {
    renderWithRouter(<FAB />);

    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));

    // Click Add Student
    fireEvent.click(screen.getByRole('button', { name: /add new student/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/students', { state: { openAddStudentModal: true } });

    // Menu should close
    await waitFor(() => {
        expect(screen.queryByRole('button', { name: /add new student/i })).not.toBeInTheDocument();
    });
  });

  it('opens QuickLogModal when Quick Log is clicked', async () => {
    renderWithRouter(<FAB />);

    // Ensure modal is closed initially - QuickLogModal content is not visible
    expect(screen.queryByRole('heading', { name: /quick log/i })).not.toBeInTheDocument();

    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));

    // Click Quick Log
    fireEvent.click(screen.getByRole('button', { name: /quick log lesson/i }));

    // Modal should be open
    expect(screen.getByRole('heading', { name: /quick log/i })).toBeInTheDocument();

    // Menu should close
    await waitFor(() => {
        expect(screen.queryByRole('button', { name: /quick log lesson/i })).not.toBeInTheDocument();
    });
  });

  it('closes QuickLogModal when onClose is called', async () => {
      renderWithRouter(<FAB />);

      // Open modal
      fireEvent.click(screen.getByRole('button', { name: /quick actions/i }));
      fireEvent.click(screen.getByRole('button', { name: /quick log lesson/i }));
      expect(screen.getByRole('heading', { name: /quick log/i })).toBeInTheDocument();

      // Close modal
      fireEvent.click(screen.getByRole('button', { name: /close quick log/i }));

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /quick log/i })).not.toBeInTheDocument();
      });
  });
});
