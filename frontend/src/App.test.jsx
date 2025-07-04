// src/App.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

// before any tests run, replace the global fetch
beforeAll(() => {
  global.fetch = vi.fn((input) => {
    switch (input) {
      case "/backend/whoami":
        return Promise.resolve({
          ok: true,
          json: async () => ({
            username: "testuser",
            user_email: "test@example.com",
          }),
        });
      case "/backend/poems":
        return Promise.resolve({
          ok: true,
          json: async () => ["roses", "snores"],
        });
      default:
        return Promise.reject(new Error(`Unhandled fetch: ${input}`));
    }
  });
});

test("renders Anagram Poems header", async () => {
  render(<App />);
  // wait for useEffect to finish its fetch
  await waitFor(() => {
    expect(screen.getByText(/Anagram Poems/i)).toBeInTheDocument();
  });
});

test("renders TextField with correct label", async () => {
  render(<App />);
  await waitFor(() => {
    expect(
      screen.getByLabelText(/Enter a name, word, or phrase/i)
    ).toBeInTheDocument();
  });
});
