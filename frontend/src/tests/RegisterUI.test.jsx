import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from '../pages/Signup'; // Path confirm kar lein

describe('Register UI Tests', () => {
  it('8. renders username input field', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    // Aapke code mein placeholder 'Enter your username' hai
    const usernameField = screen.getByPlaceholderText(/Enter your username/i);
    expect(usernameField).toBeInTheDocument();
  });

  it('9. renders email input for registration', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    // Aapka email placeholder 'name@example.com' hai
    const emailField = screen.getByPlaceholderText(/name@example.com/i);
    expect(emailField).toBeInTheDocument();
  });

  it('10. renders password input for registration', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    // Aapka password placeholder dots '••••••••' hai
    const passField = screen.getByPlaceholderText(/••••••••/i);
    expect(passField).toBeInTheDocument();
  });

  it('11. shows the "Register Now" button', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    // Multiple buttons hain (aik eye icon wala), isliye hum text se dhoondein ge
    const registerBtn = screen.getByRole('button', { name: /Register Now/i });
    expect(registerBtn).toBeInTheDocument();
  });

  it('12. shows link to go back to login', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    // Aapka text "Already have an account?" hai
    const loginLink = screen.getByText(/Already have an account\?/i);
    expect(loginLink).toBeInTheDocument();
  });
});