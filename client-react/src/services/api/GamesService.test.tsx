import { MockInstance, beforeEach, describe, expect, it, vi } from "vitest";
import { createGame, joinGame } from "./GamesService";

describe("Games Service", () => {
  let fetchSpy: MockInstance;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockReturnValue({ ok: true, json: () => Promise.resolve() });
  });

  describe("create game", () => {
    it("sends post request with given inputs", () => {
      const name = "name";
      const team = "red";
      const jsonBody = JSON.stringify({ name, team });
      createGame(name, team);
      expect(fetchSpy).toHaveBeenCalledWith("/api/games", {
        method: "POST",
        body: jsonBody,
      });
    });

    it("defaults to blue team if no team provided", () => {
      const name = "name";
      const jsonBody = JSON.stringify({ name, team: "blue" });
      createGame(name);
      expect(fetchSpy).toHaveBeenCalledWith("/api/games", {
        method: "POST",
        body: jsonBody,
      });
    });

    it("throws error if response is not okay", () => {
      const name = "name";
      fetchSpy.mockReturnValue({ ok: false, status: "404" });
      expect(() => createGame(name)).rejects.toThrowError(
        "Response status: 404"
      );
    });
  });

  describe("join game", () => {
    it("sends post request with given inputs", () => {
      const name = "name";
      const gameId = "1";
      const jsonBody = JSON.stringify({ name, gameId });
      joinGame(name, gameId);
      expect(fetchSpy).toHaveBeenCalledWith("/api/join", {
        method: "POST",
        body: jsonBody,
      });
    });

    it("throws error if response is not okay", () => {
      const name = "name";
      const gameId = "1";
      fetchSpy.mockReturnValue({ ok: false, status: "404" });
      expect(() => joinGame(name, gameId)).rejects.toThrowError(
        "Response status: 404"
      );
    });
  });
});
