import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";

test("renders Query Time branding", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  const brand = screen.getByText(/query time/i);
  expect(brand).toBeInTheDocument();
});
