import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { usePrivy } from "@privy-io/react-auth";
import axios from 'axios';
import Verida from '../Verida';

// Mock the Privy hook
jest.mock("@privy-io/react-auth", () => ({
  usePrivy: jest.fn()
}));

// Mock axios
jest.mock('axios');

describe('Verida Component', () => {
  const mockUser = {
    id: 'test-user-id'
  };

  beforeEach(() => {
    usePrivy.mockReturnValue({
      user: mockUser,
      logout: jest.fn()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders connect button when not connected', () => {
    render(
      <BrowserRouter>
        <Verida />
      </BrowserRouter>
    );

    expect(screen.getByText('Connect with Verida')).toBeInTheDocument();
  });

  it('shows loading state when connecting', async () => {
    axios.get.mockResolvedValueOnce({
      data: { success: true, authUrl: 'https://verida.test/auth' }
    });

    render(
      <BrowserRouter>
        <Verida />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Connect with Verida'));

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error state when connection fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Connection failed'));

    render(
      <BrowserRouter>
        <Verida />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Connect with Verida'));

    await waitFor(() => {
      expect(screen.getByText('Failed to connect to Verida')).toBeInTheDocument();
    });
  });

  it('shows connected state when authenticated', () => {
    // Mock URL with success status
    delete window.location;
    window.location = {
      search: '?status=success&userId=test-verida-id'
    };

    render(
      <BrowserRouter>
        <Verida />
      </BrowserRouter>
    );

    expect(screen.getByText('Verida Connected')).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    const mockLogout = jest.fn();
    usePrivy.mockReturnValue({
      user: mockUser,
      logout: mockLogout
    });

    render(
      <BrowserRouter>
        <Verida />
      </BrowserRouter>
    );

    // Simulate error state
    axios.get.mockRejectedValueOnce(new Error('Connection failed'));
    fireEvent.click(screen.getByText('Connect with Verida'));

    // Click try again button
    fireEvent.click(screen.getByText('Try Again'));

    expect(window.location.href).toContain('varidapage');
  });
}); 