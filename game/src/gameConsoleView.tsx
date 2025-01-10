import style from "./gameConsoleView.module.css";

import { useContext, useState } from "preact/hooks";
import { GameContext } from "./context";

export default function GameConsoleView() {
  return (
    <div class={style.gameConsole}>
      <TextInput />

      <div id={style.gamePropertiesInput}>
        <InputFont />
        <InputNumWords />
      </div>

      <ResetButton />
      <GameProgress />
    </div>
  );
}

function TextInput() {
  const { processInput, selectId, getGame } = useContext(GameContext);
  const [input, setInput] = useState("");
  let disabled: boolean = true;
  if (selectId !== null) {
    const game = getGame(selectId);
    if (game) {
      if (
        game.numWords < 0 ||
        game.numWords > 9999 ||
        game.complete == game.numWords
      ) {
        setInput("");
        disabled = true;
      } else {
        disabled = false;
      }
    }
  } else {
    setInput("");
    disabled = true;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput((e.target as HTMLInputElement).value);
    const matched = processInput((e.target as HTMLInputElement).value);
    if (matched) {
      setInput("");
    }
  };

  return (
    <div id={style.textInput}>
      <input
        disabled={disabled}
        type="text"
        value={input}
        onChange={handleChange}
      />
    </div>
  );
}

function InputNumWords() {
  const { changeNumWords, selectId, getGame } = useContext(GameContext);
  let disabled: boolean = true;
  let error: boolean = false;
  if (selectId !== null) {
    const game = getGame(selectId);
    if (game) {
      disabled = false;
      if (game.numWords < 0 || game.numWords > 9999) {
        error = true;
      }
    }
  } else {
    disabled = true;
  }

  const handleChange = (e: InputEvent) => {
    if (selectId !== null) {
      const game = getGame(selectId);
      const inputValue = (e.target as HTMLInputElement).value;
      const num = parseInt(inputValue) || 0;
      (e.target as HTMLInputElement).value = num.toString();

      if (game?.numWords !== num || game?.numWords === 0) {
        changeNumWords(num);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    const allowedKeys = [
      "Backspace",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Tab",
    ];
    if (e.key.match(/[0-9]/) || allowedKeys.includes(e.key)) {
      // Allow digits and control keys
      return;
    } else {
      // Prevent any other keys
      e.preventDefault();
    }
  };

  return (
    <div id={style.input}>
      <div id={style.labelProperty}>
        <label>Num Words:</label>
      </div>
      <div id={style.textFieldProperty}>
        <input
          disabled={disabled}
          type="number"
          value={selectId !== null ? getGame(selectId)?.numWords : ""}
          onInput={(e) => handleChange(e)}
          onKeyDown={(e) => handleKeyDown(e)}
          id={error ? style.numWordsInputError : style.numWordsInput}
        />
      </div>
    </div>
  );
}

function InputFont() {
  const { changeFont, selectId, getGame, updateFont } = useContext(GameContext);
  let disabled: boolean = true;

  if (selectId !== null) {
    const game = getGame(selectId);
    if (game) {
      if (
        game.numWords < 0 ||
        game.numWords > 9999 ||
        game.complete == game.numWords
      ) {
        disabled = true;
      } else {
        if (game.complete == game.numWords) {
          disabled = true;
        } else {
          disabled = false;
        }
      }
    }
  } else {
    disabled = true;
  }

  const handleChange = (e: MouseEvent) => {
    const num = parseInt((e.target as HTMLInputElement).value) || 0;
    if (selectId !== null) {
      changeFont(num);
    }
  };

  const handleInput = (e: InputEvent) => {
    const tf = e.target as HTMLInputElement;
    tf.value = tf.value.replace(/[^0-9]/g, ""); // simple text validation
    const num = parseInt(tf.value) || 0;
    tf.value = num.toString();
    if (selectId !== null) {
      updateFont(selectId, num);
    }
  };

  return (
    <div id={style.input}>
      <div id={style.labelProperty}>
        <label>Font Size:</label>
      </div>
      <div id={style.textFieldProperty}>
        <input
          disabled={disabled}
          type="range"
          min="0"
          max="100"
          value={selectId !== null ? getGame(selectId)?.font : 16}
          onMouseUp={handleChange}
          onInput={handleInput}
        />
      </div>
    </div>
  );
}

function ResetButton() {
  const { resetGame, selectId, getGame } = useContext(GameContext);
  let disabled: boolean = true;
  if (selectId !== null) {
    const game = getGame(selectId);
    if (game) {
      if (game.numWords < 0 || game.numWords > 9999) {
        disabled = true;
      } else {
        disabled = false;
      }
    }
  } else {
    disabled = true;
  }

  return (
    <div id={style.resetButton}>
      <button disabled={disabled} onClick={resetGame}>
        Reset Game
      </button>
    </div>
  );
}
function GameProgress() {
  const { selectId, getGame } = useContext(GameContext);
  let label: string = "Select / Add a game to Start!";
  if (selectId !== null) {
    const game = getGame(selectId);
    if (game) {
      if (game.numWords < 0 || game.numWords > 9999) {
        label = "Invalid Num Words! Should be in 0 - 9999";
      } else if (game.complete == game.numWords) {
        label = "Game Completed!";
      } else {
        label = `${game.complete}/${game.numWords} Words Matched`;
      }
    }
  }
  return (
    <div id={style.gameLabel}>
      <label>{label}</label>
    </div>
  );
}
