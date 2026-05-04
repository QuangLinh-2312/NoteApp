import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./NotesApp", () => () => <div>Notes App Shell</div>);
jest.mock("./components/Login", () => () => <div>Login Screen</div>);
jest.mock("./components/Register", () => () => <div>Register Screen</div>);
jest.mock("./context/AuthContext", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
  }),
}));

test("renders auth screen when user is not authenticated", () => {
  render(<App />);
  expect(screen.getByText("Login Screen")).toBeInTheDocument();
});
