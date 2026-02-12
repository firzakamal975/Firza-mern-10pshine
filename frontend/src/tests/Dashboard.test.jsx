import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard'; 
import Sidebar from '../components/Sidebar';

describe('Dashboard & Sidebar UI Tests', () => {
  
  // 13. Sidebar Logo check
  it('13. renders brand name in sidebar', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText(/NotesApp/i)).toBeInTheDocument();
  });

  // 14. Navigation Links 
  it('14. shows navigation links like "Dashboard"', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Favorite Notes/i)).toBeInTheDocument();
  });

  // 15. Search Bar 
  it('15. renders search bar in dashboard', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const searchInput = screen.getByPlaceholderText(/Search notes/i);
    expect(searchInput).toBeInTheDocument();
  });

  // 16. Add New Note 
  it('16. shows "Create New Note" element', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const addElement = screen.getByText(/Create New Note/i);
    expect(addElement).toBeInTheDocument();
  });

  // 17. Logout Button
  it('17. renders logout button in sidebar', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    const logoutBtn = screen.getByText(/Logout/i);
    expect(logoutBtn).toBeInTheDocument();
  });

  // 18. User Profile
  it('18. displays greeting message', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/Hello/i)).toBeInTheDocument();
  });

  // 19. Empty State 
  it('19. shows "0 Notes" if empty', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(screen.getByText(/0 Notes/i)).toBeInTheDocument();
  });

  // 20. Main Heading
  it('20. renders main dashboard heading', () => {
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    const heading = screen.getByRole('heading', { name: /Hello/i });
    expect(heading).toBeInTheDocument();
  });
});