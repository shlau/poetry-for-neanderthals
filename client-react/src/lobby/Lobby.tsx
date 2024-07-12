import { useEffect, useState } from "react";
import { Params, useLoaderData } from "react-router-dom";
import useWebSocket from "react-use-websocket";

export function loader(args: { request: Request; params: Params }) {
  return args.params;
}

export default function Lobby() {
  const { lobbyId } = useLoaderData() as Params;
  const socketUrl = `/channel/${lobbyId}/ws`;
  const [messageHistory, setMessageHistory] = useState<MessageEvent<any>[]>([]);
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    console.log(lastMessage);
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  return (
    <div>
      <p>{lobbyId}</p>
      <button onClick={() => sendMessage("hello")}>click me</button>
    </div>
  );
}
