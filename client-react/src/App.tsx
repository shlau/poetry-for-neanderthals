import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.less";
import Home from "./home/Home";
import Lobby from "./lobby/Lobby";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/lobby/:lobbyId",
    element: <Lobby />,
  },
]);
function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
