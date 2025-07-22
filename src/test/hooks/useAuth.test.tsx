import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: null }
    });
    const mockOnAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    vi.mocked(supabase.auth.getSession).mockImplementation(mockGetSession);
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it('sets user when session exists', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: { user: mockUser } }
    });
    const mockOnAuthStateChange = vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    });

    vi.mocked(supabase.auth.getSession).mockImplementation(mockGetSession);
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('handles auth state changes', async () => {
    const mockUser = { id: '1', email: 'test@example.com' };
    let authCallback: (event: string, session: any) => void;

    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: null }
    });
    const mockOnAuthStateChange = vi.fn().mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    vi.mocked(supabase.auth.getSession).mockImplementation(mockGetSession);
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate sign in
    authCallback!('SIGNED_IN', { user: mockUser });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });
});