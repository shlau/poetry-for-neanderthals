import { describe, it } from "vitest";
import Home from "./Home";
import { render } from "@testing-library/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
]);
describe("Home", () => {
  it("renders", () => {
    render(<RouterProvider router={router}></RouterProvider>);
  });
});
