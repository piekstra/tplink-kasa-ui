import { render, screen } from '@testing-library/react';
import App from './App';

test('renders server time', () => {
  render(<App />);
  const linkElement = screen.getByText(/current time/i);
  expect(linkElement).toBeInTheDocument();
});
