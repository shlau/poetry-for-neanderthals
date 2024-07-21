import { User } from "../../models/User.model";

const API_ENDPOINT = "/api";

export async function createGame(name: string, team: string = "unassigned"): Promise<User> {
  try {
    const response = await fetch(`${API_ENDPOINT}/games`, {
      method: "POST",
      body: JSON.stringify({ name, team }),
    });
    if (!response.ok) {
      return Promise.reject(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    return Promise.reject(err);
  }
}

export async function joinGame(name: string, gameId: string): Promise<User> {
  try {
    const response = await fetch(`${API_ENDPOINT}/join`, {
      method: "POST",
      body: JSON.stringify({ name, gameId }),
    });
    if (!response.ok) {
      return Promise.reject(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    return Promise.reject(err);
  }
}
