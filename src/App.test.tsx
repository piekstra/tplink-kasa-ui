import React from 'react';
import { render, screen } from '@testing-library/react';
import App from 'src/App';

test('renders sign in screen', () => {
  render(<App />);
  const linkElement = screen.getByText(/Sign In/);
  expect(linkElement).toBeInTheDocument();
});
