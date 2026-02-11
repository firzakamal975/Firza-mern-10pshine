import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login'; 

describe('Auth UI Tests', () => {
  // Test 3: Email (Aapka placeholder 'email@example.com' hai)
  it('3. renders email input field', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const emailField = screen.getByPlaceholderText(/email@example.com/i);
    expect(emailField).toBeInTheDocument();
  });

  // Test 4: Password (Aapka placeholder '••••••••' hai)
  it('4. renders password input field', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const passwordField = screen.getByPlaceholderText(/••••••••/i);
    expect(passwordField).toBeInTheDocument();
  });

  // Test 5: Login Button (Aapka button text 'Login Now' hai)
  it('5. has a login button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const loginBtn = screen.getByRole('button', { name: /login now/i });
    expect(loginBtn).toBeInTheDocument();
  });

  // Test 6: Signup Link (Aapka text 'New here? Create account' hai)
  it('6. shows register link', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const registerLink = screen.getByText(/create account/i);
    expect(registerLink).toBeInTheDocument();
  });

  // Test 7: Heading Check (Aapka main heading 'Login' hai)
  // Note: HTML mein 10PSHINE nazar nahi aa raha, isliye hum 'Login' heading check karenge
  it('7. checks for main login heading', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const heading = screen.getByRole('heading', { name: /login/i });
    expect(heading).toBeInTheDocument();
  });
});