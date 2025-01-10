import { useContext } from "preact/hooks";
import { GameContext } from "./context";
import style from "./Toolbar.module.css";

export default function Toolbar() {
  return (
    <div class={style.Toolbar}>
      <ThreeButtons />
      <ThreeButtonsRight />
    </div>
  );
}

function ThreeButtons() {
  const { createGame, deleteGame, clearGames, selectId, games } =
    useContext(GameContext);
  return (
    <div class={style.threeButtons}>
      <button disabled={games.length >= 20} onClick={() => createGame()}>
        Add Game
      </button>
      <button disabled={games.length == 0} onClick={() => deleteGame(selectId)}>
        Delete Game
      </button>
      <button disabled={games.length == 0} onClick={() => clearGames()}>
        Clear Games
      </button>
    </div>
  );
}

function ThreeButtonsRight() {
  const { undo, redo, setLanguage, language, canRedo, canUndo } =
    useContext(GameContext);
  return (
    <div class={style.threeButtons}>
      <button disabled={!canUndo()} onClick={() => undo()}>
        Undo
      </button>
      <button disabled={!canRedo()} onClick={() => redo()}>
        Redo
      </button>
      <select
        value={language}
        onChange={(e) => setLanguage((e.target as HTMLSelectElement).value)}
      >
        <option value="english">English</option>
        <option value="french">Français</option>
      </select>
    </div>
  );
}
