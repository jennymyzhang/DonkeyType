import { render } from "preact";
import { GameProvider } from "./context";
import Toolbar from "./Toolbar";
import GameAreaView from "./gameAreaView";
import GameConsoleView from "./gameConsoleView";
import GameListView from "./gameListView";
import style from "./main.module.css";

export default function App() {
  return (
    <div id={style.main}>
      <GameProvider>
        <Toolbar />
        <div id={style.gameBody}>
          <div id={style.left}>
            <GameAreaView />
            <GameConsoleView />
          </div>
          <GameListView />
        </div>
      </GameProvider>
    </div>
  );
}

render(<App />, document.getElementById("app") as Element);
