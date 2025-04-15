import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock data
const mockQuestions = [
  {
    id: 1,
    prompt: "What is your name?",
    answers: ["John", "Jane", "Mike", "Sarah"],
    correctIndex: 0
  }
];

// Mock fetch implementation
beforeEach(() => {
  global.fetch = jest.fn()
    // Mock GET request
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions)
      })
    )
    // Mock POST request
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 2,
          prompt: "New Question",
          answers: ["A", "B", "C", "D"],
          correctIndex: 0
        })
      })
    )
    // Mock DELETE request
    .mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );
});

afterEach(() => {
  global.fetch.mockClear();
});

describe('App Component', () => {
  test('displays question prompts after fetching', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("What is your name?")).toBeInTheDocument();
    });
  });

  test('creates a new question when form is submitted', async () => {
    render(<App />);
    
    // Wait for initial load
    await screen.findByText(/what is your name/i);
    
    // Open form
    fireEvent.click(screen.getByText(/new question/i));
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/prompt/i), {
      target: { value: "New Question" }
    });
    
    // Submit form
    fireEvent.click(screen.getByText(/submit question/i));
    
    // Verify
    await waitFor(() => {
      expect(screen.getByText("New Question")).toBeInTheDocument();
    });
  });

  test('deletes question when delete button is clicked', async () => {
    render(<App />);
    
    // Wait for initial load
    await screen.findByText(/what is your name/i);
    
    // Click delete button
    fireEvent.click(screen.getAllByText(/delete/i)[0]);
    
    // Verify
    await waitFor(() => {
      expect(screen.queryByText("What is your name?")).not.toBeInTheDocument();
    });
  });

  test('updates answer when dropdown is changed', async () => {
    render(<App />);
    
    // Wait for initial load
    await screen.findByText(/what is your name/i);
    
    // Change dropdown
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: "1" }
    });
    
    // Verify fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:4000/questions/1",
        expect.objectContaining({
          method: "PATCH"
        })
      );
    });
  });
});