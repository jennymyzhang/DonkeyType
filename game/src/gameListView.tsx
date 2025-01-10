import { useContext } from "preact/hooks";
import style from "./gameListView.module.css";
import { GameContext } from "./context";

export default function GameListView() {
  const { games } = useContext(GameContext);
  return (
    <div id={style.gameList}>
      {games.map((game) => (
        <GameProgress id={game.id} />
      ))}
    </div>
  );
}

type GameProgressProps = {
  id: number;
};
function GameProgress({ id }: GameProgressProps) {
  const { select, selectId } = useContext(GameContext);
  return (
    <div
      id={style.gameProgress}
      onClick={() => select(id)}
      style={{ border: id === selectId ? "2px solid red" : "1px solid black" }}
    >
      <GameId id={id} />
      <ProgressBar id={id} />
    </div>
  );
}

function ProgressBar({ id }: GameProgressProps) {
  const { selectId, getGame } = useContext(GameContext);
  const game = getGame(id);
  if (!game) {
    return <div></div>;
  } else {
    let flexIncomplete: number = game.numWords - game.complete;
    let flexComplete: number = game.complete;
    if (game.numWords === 0) {
      flexIncomplete = 0;
      flexComplete = 1;
    } else if (game.numWords < 0 || game.numWords > 9999) {
      flexIncomplete = 1;
      flexComplete = 0;
    }
    return (
      <div
        id={style.progressBar}
        style={{ height: id === selectId ? "76px" : "78px" }}
      >
        <div id={style.complete} style={{ flex: flexComplete }}></div>
        <div id={style.incomplete} style={{ flex: flexIncomplete }}></div>
      </div>
    );
  }
}

function GameId({ id }: GameProgressProps) {
  return (
    <div id={style.gameId}>
      <label>Game {id}</label>
    </div>
  );
}
