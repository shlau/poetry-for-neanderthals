import { MockInstance, beforeEach, describe, expect, it, vi } from "vitest";
import { createGame, joinGame, resetWords, uploadWords } from "./GamesService";
import { Team } from "../../models/User.model";

describe("Games Service", () => {
  let fetchSpy: MockInstance;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockReturnValue({ ok: true, json: () => Promise.resolve() });
  });

  describe("create game", () => {
    it("sends post request with given inputs", () => {
      const name = "name";
      const team = Team.RED;
      const jsonBody = JSON.stringify({ name, team: "2" });
      createGame(name, team);
      expect(fetchSpy).toHaveBeenCalledWith("/api/games", {
        method: "POST",
        body: jsonBody,
      });
    });

    it("defaults to unassigned if no team provided", () => {
      const name = "name";
      const jsonBody = JSON.stringify({ name, team: "0" });
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

  describe("reset words", () => {
    it("sends post request with given inputs", () => {
      const gameId = "1";
      resetWords(gameId);
      expect(fetchSpy).toHaveBeenCalledWith(`/api/reset_words/${gameId}`, {
        method: "POST",
      });
    });

    it("throws error if response is not okay", () => {
      const gameId = "1";
      fetchSpy.mockReturnValue({ ok: false, status: "404" });
      expect(() => resetWords(gameId)).rejects.toThrowError(
        "Response status: 404"
      );
    });
  });

  describe("uploadWords", () => {
    it("sends post request with given inputs", () => {
      const gameId = "1";
      const action = "overwrite";
      const file = new File([""], "filename");
      const formData = new FormData();
      formData.set("gameWords", file);

      uploadWords(file, gameId, action);
      expect(fetchSpy).toHaveBeenCalledWith(`/api/upload/${gameId}/${action}`, {
        method: "POST",
        body: formData,
      });
    });

    it("throws error if response is not okay", () => {
      const gameId = "1";
      const file = new File([""], "filename");
      fetchSpy.mockReturnValue({ ok: false, status: "404" });
      expect(() => uploadWords(file, gameId, "overwrite")).rejects.toThrowError(
        "Response status: 404"
      );
    });
  });
});
