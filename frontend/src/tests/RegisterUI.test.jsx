import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Signup'; 

describe('Register UI Tests', () => {
  it('8. renders username input field', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const usernameField = screen.getByPlaceholderText(/Enter your username/i);
    expect(usernameField).toBeInTheDocument();
  });

  it('9. renders email input for registration', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const emailField = screen.getByPlaceholderText(/name@example.com/i);
    expect(emailField).toBeInTheDocument();
  });

  it('10. renders password input for registration', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const passField = screen.getByPlaceholderText(/••••••••/i);
    expect(passField).toBeInTheDocument();
  });

  it('11. shows the "Register Now" button', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const registerBtn = screen.getByRole('button', { name: /Register Now/i });
    expect(registerBtn).toBeInTheDocument();
  });

  it('12. shows link to go back to login', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const loginLink = screen.getByText(/Already have an account\?/i);
    expect(loginLink).toBeInTheDocument();
  });
});