import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login'; 

describe('Auth UI Tests', () => {

  it('3. renders email input field', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const emailField = screen.getByPlaceholderText(/email@example.com/i);
    expect(emailField).toBeInTheDocument();
  });

  it('4. renders password input field', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const passwordField = screen.getByPlaceholderText(/••••••••/i);
    expect(passwordField).toBeInTheDocument();
  });

  it('5. has a login button', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const loginBtn = screen.getByRole('button', { name: /login now/i });
    expect(loginBtn).toBeInTheDocument();
  });

  it('6. shows register link', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const registerLink = screen.getByText(/create account/i);
    expect(registerLink).toBeInTheDocument();
  });

  it('7. checks for main login heading', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    const heading = screen.getByRole('heading', { name: /login/i });
    expect(heading).toBeInTheDocument();
  });
});