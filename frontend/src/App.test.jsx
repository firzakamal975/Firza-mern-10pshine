import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

// Yahan humne Router ko hamesha ke liye hata diya kyunki App.jsx mein wo pehle se hai
describe('Frontend Initial Test', () => {
  it('1. should render the application without crashing', () => {
    render(<App />);
  });

  it('2. should verify if the main app container exists', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });
});