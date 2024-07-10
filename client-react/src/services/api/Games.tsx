const endpoint = "/games";
export interface User {
  id: string;
  name: string;
  team: string;
  gameId: string;
}

export async function createGame(
  name: string,
  team: string = "blue"
): Promise<User | null> {
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (err: any) {
    return null;
  }
}
