import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.less";
import Home from "./home/Home";
import Lobby, { loader as lobbyLoader } from "./lobby/Lobby";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/lobby/:lobbyId",
    loader: lobbyLoader,
    element: <Lobby />,
  },
]);
function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
