import style from "./gameAreaView.module.css";
import { useContext } from "preact/hooks";
import { GameContext } from "./context";

export default function GameAreaView() {
  const { selectId, getGame, language, getClicked, changeFocus, games } =
    useContext(GameContext);

  const handleClick = (order: number) => {
    if (selectId !== null) {
      const game = getGame(selectId);
      if (game && game.complete < game.numWords) {
        changeFocus(order);
      }
    }
  };

  if (selectId === null) {
    return <div class={style.gameArea}></div>;
  } else {
    const game = getGame(selectId);
    if (game) {
      if (game.numWords < 0 || game.numWords > 9999) {
        return (
          <div class={style.gameAreaError}>
            <label id={style.error}>INVALID GAME PARAMETERS!</label>
          </div>
        );
      } else {
        let classes: string[] = [];
        for (let i: number = 0; i < game.numWords; i++) {
          if (game.completed[i]) {
            if (game.complete == game.numWords) {
              classes.push(style.completedcompleted);
            } else {
              classes.push(style.completed);
            }
          } else if (i == game.focused && getClicked()) {
            classes.push(style.userFocused);
          } else if (i == game.focused) {
            classes.push(style.focused);
          } else {
            classes.push(style.incomplete);
          }
        }
        return (
          <div
            class={
              game.complete == game.numWords
                ? style.gameAreaComplete
                : style.gameArea
            }
          >
            {game.text.map((word, index) => (
              <div
                id={style.oneText}
                class={classes[index]}
                onClick={() => handleClick(index)}
              >
                <label key={index} style={{ fontSize: game.font }}>
                  {" "}
                  {word[language === "english" ? "en-CA" : "fr-CA"]}
                </label>
              </div>
            ))}
          </div>
        );
      }
    }
  }
  return <div>never reach</div>;
}
