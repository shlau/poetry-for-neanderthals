import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.less";
import Home from "./home/Home";
import GameSession from "./gameSession/GameSession";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/lobby/:lobbyId",
    element: <GameSession />,
  },
]);
function App() {
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
