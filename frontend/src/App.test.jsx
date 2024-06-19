import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test("renders Anagram Poems header", () => {
  render(<App />);
  const headerElement = screen.getByText(/Anagram Poems/i);
  expect(headerElement).toBeInTheDocument();
});

test("renders TextField with correct label", () => {
  render(<App />);
  const textFieldElement = screen.getByLabelText(
    /Enter a name, word, or phrase/i
  );
  expect(textFieldElement).toBeInTheDocument();
});
